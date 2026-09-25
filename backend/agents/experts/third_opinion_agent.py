import os
import sys
import json
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from core.llm_gateway import call_llm

EXPERT_MAP = {
    "PPE": "food_hygiene_expert",
    "HYGIENE": "food_hygiene_expert",
    "STORAGE": "food_storage_expert",
    "PRODUCT": "food_compliance_expert",
    "TRACEABILITY": "supply_chain_expert",
    "GENERAL": "general_safety_expert"
}

def get_expert_type(category: str) -> str:
    return EXPERT_MAP.get(category.upper(), "general_safety_expert")

def request_third_opinion(violation: dict) -> dict:
    expert_type = get_expert_type(violation.get("category", "GENERAL"))
    
    prompt = f"""
    You are a {expert_type.replace('_', ' ').title()}. We need a third expert opinion on a recorded violation.
    
    Violation Details:
    - Type: {violation.get('violation_type')}
    - Category: {violation.get('category')}
    - Severity: {violation.get('severity')}
    
    Original AI Decision (Rule Engine / Judge):
    {violation.get('ai_decision', {})}
    
    Evidence Notes (Detections):
    {violation.get('evidence', [])}
    
    Provide an expert opinion, severity assessment, and recommended corrective action.
    Respond strictly in JSON format with keys:
    "opinion" (string), "severity" (string), "recommendation" (string), "confidence" (float)
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
        return {
            "expert_type": expert_type,
            "opinion": result.get("opinion", ""),
            "severity": result.get("severity", violation.get("severity")),
            "recommendation": result.get("recommendation", ""),
            "confidence": result.get("confidence", 0.9),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise RuntimeError(f"Third expert returned invalid JSON: {e}") from e
