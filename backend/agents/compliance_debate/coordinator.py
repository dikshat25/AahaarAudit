import sys
import os
import concurrent.futures
from difflib import SequenceMatcher

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from agents.compliance_debate.gemini_agent import run_gemini_analysis
from agents.compliance_debate.groq_agent import run_groq_analysis
from agents.compliance_debate.debate_round import run_critique
from agents.compliance_debate.judge_agent import run_judge

def compute_agreement(text1: str, text2: str) -> float:
    """
    Computes a simple agreement score based on keyword matching for 'violation' or 'clear'.
    If they share the same verdict keyword, score is high.
    Otherwise, fallback to sequence matching.
    """
    t1 = text1.lower()
    t2 = text2.lower()
    
    t1_verdict = "violation" if "violation" in t1 else ("clear" if "clear" in t1 else "unknown")
    t2_verdict = "violation" if "violation" in t2 else ("clear" if "clear" in t2 else "unknown")
    
    if t1_verdict != "unknown" and t1_verdict == t2_verdict:
        return 0.90
    elif t1_verdict != "unknown" and t2_verdict != "unknown" and t1_verdict != t2_verdict:
        return 0.10
        
    return SequenceMatcher(None, t1, t2).ratio()

def coordinate_debate(context: str, facts: str) -> dict:
    """
    Coordinates the debate between the Legal (Gemini) and Risk (Groq) agents.
    Returns a dictionary containing the transcript, agreement score, rounds, and final verdict.
    """
    transcript = []
    
    # Round 1: Independent Analysis
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_gemini = executor.submit(run_gemini_analysis, context, facts)
        future_groq = executor.submit(run_groq_analysis, context, facts)
        
        gemini_response = future_gemini.result()
        groq_response = future_groq.result()
        
    transcript.append({"role": "gemini_legal", "content": gemini_response})
    transcript.append({"role": "groq_risk", "content": groq_response})
    
    agreement = compute_agreement(gemini_response, groq_response)
    
    if agreement >= 0.70:
        # High agreement, go straight to judge
        judge_result = run_judge(facts, gemini_response, groq_response)
        return {
            "transcript": transcript,
            "agreement_score": agreement,
            "rounds": 1,
            "final_verdict": judge_result.get("verdict", "ambiguous"),
            "final_confidence": judge_result.get("confidence", 0.5),
            "justification": judge_result.get("justification", "High agreement, no second round needed.")
        }
        
    # Round 2: Critique
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_gemini_critique = executor.submit(
            run_critique, "gemini", "Legal", gemini_response, groq_response
        )
        future_groq_critique = executor.submit(
            run_critique, "groq", "Risk", groq_response, gemini_response
        )
        
        gemini_critique = future_gemini_critique.result()
        groq_critique = future_groq_critique.result()

    transcript.append({"role": "gemini_critique", "content": gemini_critique})
    transcript.append({"role": "groq_critique", "content": groq_critique})
    
    # Final Judge
    judge_result = run_judge(facts, gemini_response, groq_response, gemini_critique, groq_critique)
    
    transcript.append({"role": "judge", "content": judge_result.get("justification", "")})
    
    return {
        "transcript": transcript,
        "agreement_score": agreement,
        "rounds": 2,
        "final_verdict": judge_result.get("verdict", "ambiguous"),
        "final_confidence": judge_result.get("confidence", 0.5),
        "justification": judge_result.get("justification", "")
    }
