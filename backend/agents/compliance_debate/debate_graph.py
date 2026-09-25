import concurrent.futures
from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from agents.compliance_debate.debate_round import run_critique
from agents.compliance_debate.gemini_agent import run_gemini_analysis
from agents.compliance_debate.groq_agent import run_groq_analysis
from agents.compliance_debate.judge_agent import run_judge

def run_with_provider_fallback(primary_call, fallback_call):
    try:
        return primary_call(), "gemini"
    except RuntimeError as primary_error:
        try:
            return fallback_call(), "groq"
        except RuntimeError as fallback_error:
            raise RuntimeError(f"Both configured LLM providers failed. Gemini: {primary_error}; Groq: {fallback_error}") from fallback_error


class DebateState(TypedDict, total=False):
    context: str
    facts: str
    transcript: list[dict[str, str]]
    agreement_score: float
    rounds: int
    gemini_response: str
    groq_response: str
    gemini_critique: str
    groq_critique: str
    final_verdict: str
    final_confidence: float
    justification: str


def independent_analysis(state: DebateState) -> DebateState:
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        gemini_future = executor.submit(
            run_with_provider_fallback,
            lambda: run_gemini_analysis(state["context"], state["facts"]),
            lambda: run_groq_analysis(state["context"], state["facts"]),
        )
        groq_future = executor.submit(run_groq_analysis, state["context"], state["facts"])
        gemini_response, gemini_provider = gemini_future.result()
        groq_response = groq_future.result()
    return {
        "gemini_response": gemini_response,
        "groq_response": groq_response,
        "transcript": [
            {"role": "gemini_legal", "provider": gemini_provider, "content": gemini_response},
            {"role": "groq_risk", "provider": "groq", "content": groq_response},
        ],
        "rounds": 1,
    }


def critique_round(state: DebateState) -> DebateState:
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        gemini_future = executor.submit(
            run_critique, "groq", "Legal", state["gemini_response"], state["groq_response"]
        )
        groq_future = executor.submit(run_critique, "groq", "Risk", state["groq_response"], state["gemini_response"])
        gemini_critique = gemini_future.result()
        groq_critique = groq_future.result()
    return {
        "gemini_critique": gemini_critique,
        "groq_critique": groq_critique,
        "transcript": state["transcript"] + [
            {"role": "legal_review", "provider": "groq", "content": gemini_critique},
            {"role": "risk_review", "provider": "groq", "content": groq_critique},
        ],
        "rounds": 2,
    }


def judge_round(state: DebateState) -> DebateState:
    result = run_judge(
        state["facts"],
        state["gemini_response"],
        state["groq_response"],
        state.get("gemini_critique", ""),
        state.get("groq_critique", ""),
        provider="groq",
    )
    judge_provider = "groq"
    justification = result.get("justification", "")
    return {
        "final_verdict": result.get("verdict", "unresolved"),
        "final_confidence": result.get("confidence", 0.0),
        "justification": justification,
        "transcript": state["transcript"] + [{"role": "judge", "provider": judge_provider, "content": justification}],
    }


def build_debate_graph():
    graph = StateGraph(DebateState)
    graph.add_node("independent_analysis", independent_analysis)
    graph.add_node("critique_round", critique_round)
    graph.add_node("judge_round", judge_round)
    graph.add_edge(START, "independent_analysis")
    graph.add_edge("independent_analysis", "critique_round")
    graph.add_edge("critique_round", "judge_round")
    graph.add_edge("judge_round", END)
    return graph.compile()


debate_graph = build_debate_graph()


def run_debate_graph(context: str, facts: str) -> dict[str, Any]:
    result = debate_graph.invoke({"context": context, "facts": facts})
    return {
        "transcript": result["transcript"],
        "agreement_score": 0.0,
        "rounds": result.get("rounds", 2),
        "final_verdict": result.get("final_verdict", "unresolved"),
        "final_confidence": result.get("final_confidence", 0.0),
        "justification": result.get("justification", ""),
    }


def stream_debate_graph(context: str, facts: str):
    """Yield each real agent response as soon as its provider call completes.
    Each phase is wrapped individually so a failure in one phase doesn't
    silently swallow subsequent agents.
    """
    state: DebateState = {"context": context, "facts": facts, "transcript": []}

    # ── Phase 1: Independent analysis (Prosecution + Defense) ───────────────
    try:
        independent = independent_analysis(state)
        state.update(independent)
        for message in independent["transcript"]:
            yield {"type": "agent", "message": message}
    except RuntimeError as exc:
        yield {"type": "debate_error", "error": f"Phase 1 (Independent Analysis) failed: {exc}"}
        # Still emit a fallback verdict so the stream ends cleanly
        yield {
            "type": "debate_complete",
            "debate": {
                "transcript": state.get("transcript", []),
                "rounds": 0,
                "final_verdict": "unresolved",
                "final_confidence": 0.0,
                "justification": f"Debate could not be completed: {exc}",
            },
        }
        return

    # ── Phase 2: Critique round (both agents rebut each other) ──────────────
    try:
        critique = critique_round(state)
        state.update(critique)
        existing_ids = {id(m) for m in independent["transcript"]}
        for message in critique["transcript"]:
            if id(message) not in existing_ids:
                yield {"type": "agent", "message": message}
    except RuntimeError as exc:
        yield {"type": "debate_error", "error": f"Phase 2 (Critique Round) failed: {exc}"}
        # Continue to judge even if critique failed

    # ── Phase 3: Judge delivers final verdict ───────────────────────────────
    try:
        judged = judge_round(state)
        state.update(judged)
        judge_msg = judged["transcript"][-1]
        yield {"type": "agent", "message": judge_msg}
        yield {
            "type": "debate_complete",
            "debate": {
                "transcript": state["transcript"],
                "rounds": state.get("rounds", 2),
                "final_verdict": state.get("final_verdict", "unresolved"),
                "final_confidence": state.get("final_confidence", 0.0),
                "justification": state.get("justification", ""),
            },
        }
    except RuntimeError as exc:
        yield {"type": "debate_error", "error": f"Phase 3 (Judge) failed: {exc}"}
        yield {
            "type": "debate_complete",
            "debate": {
                "transcript": state.get("transcript", []),
                "rounds": state.get("rounds", 2),
                "final_verdict": "unresolved",
                "final_confidence": 0.0,
                "justification": f"Judge could not reach a verdict: {exc}",
            },
        }