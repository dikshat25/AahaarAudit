import os
import sys

# Add backend to path to use the unified failover gateway
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'backend')))
from core.llm_gateway import call_llm

def generate_explanation(flags: list, details: dict, payload: dict) -> str:
    if not flags:
        return "Conclusion: The product passed all checks and is safe for use."
        
    prompt = f"""
    You are an expert food safety inspector and auditor. A product was just scanned and flagged for the following issues: {', '.join(flags)}.
    
    Here is the product info: {payload}
    Here are the detailed checks: {details}
    
    Please provide a concise, professional explanation formatted clearly with:
    - **Why:** Why the product was flagged.
    - **How:** How this violates safety protocols or what the specific danger is.
    - **Conclusion:** A final recommendation on what action the inspector should take.
    
    Keep it brief (max 3 short paragraphs). Use a professional, authoritative tone.
    """
    
    try:
        # Defaults to the failover system starting with Groq
        return call_llm(prompt, provider="groq")
    except Exception as e:
        return f"Explanation could not be generated at this time due to an AI service error: {e}"
