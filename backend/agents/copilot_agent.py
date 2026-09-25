import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from core.llm_gateway import call_llm

def generate_copilot_checklist(establishment_data: dict, current_violations: list, historical_violations: list, inspection_context: str) -> dict:
    
    prompt = f"""
    You are an AI Inspection Copilot assisting a food safety inspector.
    Based on the following data, generate a targeted, contextual inspection checklist.
    DO NOT invent previous violations. Only use the data provided.
    
    Establishment Info: {establishment_data}
    Inspection Context: {inspection_context}
    Current Detected Violations: {[v.get('violation_type') for v in current_violations]}
    Historical Violations (Active Window): {[v.get('violation_type') for v in historical_violations]}
    
    Return your response strictly in JSON format matching this schema:
    {{
        "establishment_id": "string",
        "checklist": [
            {{
                "category": "string (e.g. PPE, Storage)",
                "item": "string (The specific check to perform)",
                "priority": "string (high, medium, low)",
                "reason": "string (Why this is on the list based on history/current)"
            }}
        ],
        "summary": "string"
    }}
    """
    
    response_text = call_llm(prompt, provider='gemini')
    
    try:
        import re
        match = re.search(r'\{.*\}', response_text.strip(), re.DOTALL)
        if match:
            json_str = match.group(0)
        else:
            json_str = response_text.strip()
            
        result = json.loads(json_str)
        
        # Ensure establishment_id matches
        result["establishment_id"] = establishment_data.get("establishment_id", "")
        return result
    except Exception as e:
        raise RuntimeError(f"Copilot model returned invalid checklist JSON: {e}") from e
