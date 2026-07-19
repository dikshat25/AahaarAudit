import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from core.llm_gateway import call_llm

def run_judge(facts: str, gemini_original: str, groq_original: str, gemini_critique: str = "", groq_critique: str = "") -> dict:
    """
    Acts as the final judge to produce the final verdict.
    """
    prompt = f"""
    You are the Chief Inspector for Food Safety. You must make a final determination on a case.
    Facts: {facts}
    
    Legal Argument: {gemini_original}
    Risk Argument: {groq_original}
    
    Legal Critique: {gemini_critique}
    Risk Critique: {groq_critique}
    
    Based on the arguments, determine if this is a "violation" or "clear". 
    Provide a confidence score (0.0 to 1.0) and a justification.
    
    Respond STRICTLY in JSON format with keys:
    "verdict" (string: "violation" or "clear"),
    "confidence" (float),
    "justification" (string)
    
    IMPORTANT: The "justification" MUST be written in a conversational, human-like voice, exactly as if a person were speaking their final conclusion out loud (e.g., "Alright, looking at this, it's clear gloves are not worn and everything, so I have to say this is a violation because..."). It must clearly state WHAT your final conclusion is and WHY you are making that decision. Avoid any technical ML jargon. DO NOT use markdown wrappers like ```json, just return the raw JSON object.
    """
    
    # We use Gemini for the judge as it's typically better at complex reasoning and JSON output.
    response_text = call_llm(prompt, provider='gemini')
    
    try:
        import re
        json_str = response_text.strip()
        # Extract json using regex
        match = re.search(r'\{.*\}', json_str, re.DOTALL)
        if match:
            json_str = match.group(0)
            
        result = json.loads(json_str)
        return result
    except Exception as e:
        print(f"Error parsing Judge output: {e}\nOutput was: {response_text}")
        return {
            "verdict": "unresolved",
            "confidence": 0.0,
            "justification": "Judge parsing failed, defaulting to manual review"
        }
