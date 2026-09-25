import sys
import os
from difflib import SequenceMatcher

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from agents.compliance_debate.debate_graph import run_debate_graph

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
    result = run_debate_graph(context, facts)
    transcript = result["transcript"]
    if len(transcript) >= 2:
        result["agreement_score"] = compute_agreement(transcript[0]["content"], transcript[1]["content"])
    return result
