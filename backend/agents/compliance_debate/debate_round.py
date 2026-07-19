import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from core.llm_gateway import call_llm

def run_critique(provider: str, my_role: str, my_original: str, opponent_original: str) -> str:
    """
    Runs a critique round where an agent reviews the opponent's argument.
    """
    prompt = f"""
    You are in a debate regarding a food safety violation.
    Your role: {my_role}
    Your original argument: {my_original}
    Your opponent's argument: {opponent_original}
    
    Critique your opponent's argument and defend your position. Keep it concise.
    IMPORTANT: Speak plainly and avoid technical ML jargon like "confidence levels", "bounding boxes", "detections", or "the model detected".
    """
    return call_llm(prompt, provider=provider)
