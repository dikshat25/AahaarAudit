import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from core.llm_gateway import call_llm

def run_groq_analysis(context: str, facts: str) -> str:
    """
    Role: Risk/Counterargument.
    Analyzes the situation from a risk mitigation and pragmatic operational standpoint.
    """
    prompt = f"""
    You are a pragmatic risk assessment officer for food safety.
    Review the following automated inspection facts and context:
    Context: {context}
    Facts: {facts}
    
    Argue whether this is a genuine operational risk or a false alarm/minor issue 
    that doesn't warrant a critical violation. Keep it concise.
    IMPORTANT: Speak plainly as if looking at the camera feed. Say things like "The person is far away from the food". DO NOT use technical ML jargon like "confidence levels", "bounding boxes", "detections", or "the model detected".
    """
    return call_llm(prompt, provider='groq')
