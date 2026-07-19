from typing import List, Dict, Any
from core.db.models import ViolationModel

def calculate_risk_score(violations: List[ViolationModel]) -> float:
    """
    Calculates a deterministic risk score based on violations.
    Different violations have different weights.
    """
    weights = {
        "Cross-contamination risk (proximity violation detected)": 5.0,
        "Missing mandatory PPE: mask": 2.0,
        "Missing mandatory PPE: gloves": 2.0,
        "Missing mandatory PPE: hat": 1.5,
    }
    
    score = 0.0
    for v in violations:
        # v is a dict if it came from rule engine or EventModel dictionary, 
        # but the prompt assumes we get simple descriptions from the rule engine.
        # Let's assume `violations` is a list of matched rule strings here
        # or we adapt to receive matched rules.
        pass

def score_event(matched_rules: List[str]) -> float:
    """
    Scores an event based on matched rules.
    """
    weights = {
        "Cross-contamination risk (proximity violation detected)": 5.0,
        "Missing or incorrect mandatory PPE: mask": 2.0,
        "Missing mandatory PPE: glove": 2.0,
        "Missing mandatory PPE: hairnet": 1.5,
    }
    
    score = 0.0
    for rule in matched_rules:
        # exact match
        if rule in weights:
            score += weights[rule]
        else:
            # check for prefix
            for k, w in weights.items():
                if rule.startswith(k):
                    score += w
                    break
            else:
                # default penalty for unknown violation
                score += 1.0
                
    return score
