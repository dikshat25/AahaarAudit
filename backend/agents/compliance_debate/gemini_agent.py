import sys
import os

# Add backend to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from core.llm_gateway import call_llm

def run_gemini_analysis(context: str, facts: str) -> str:
    """
    Role: Legal/Regulatory Reasoning.
    Analyzes the ambiguous or severe situation based on facts.
    """
    prompt = f"""
    You are a regulatory compliance expert for food safety (FSSAI).
    Review the following automated inspection facts and context:
    Context: {context}
    Facts: {facts}
    
    Determine if this represents a concrete food safety violation, 
    and provide your legal/regulatory reasoning. Keep it concise.
    IMPORTANT: Speak plainly as if looking at the camera feed. Say things like "The image shows a person cooking without a mask". DO NOT use technical ML jargon like "confidence levels", "bounding boxes", "detections", or "the model detected".
    """
    return call_llm(prompt, provider='gemini')
