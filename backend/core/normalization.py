def normalize_violation(rule_message: str) -> dict:
    rule = rule_message.lower()
    
    if "hairnet" in rule:
        return {"category": "PPE", "violation_type": "missing_hairnet", "severity": "high"}
    elif "glove" in rule:
        return {"category": "PPE", "violation_type": "missing_gloves", "severity": "high"}
    elif "mask" in rule:
        return {"category": "PPE", "violation_type": "missing_mask", "severity": "high"}
    elif "proximity" in rule or "cross-contamination" in rule:
        return {"category": "HYGIENE", "violation_type": "cross_contamination", "severity": "critical"}
    elif "expired" in rule:
        return {"category": "PRODUCT", "violation_type": "expired_product", "severity": "high"}
    elif "unregistered" in rule:
        return {"category": "PRODUCT", "violation_type": "unregistered_supplier", "severity": "high"}
    elif "incomplete" in rule:
        return {"category": "PRODUCT", "violation_type": "incomplete_data", "severity": "medium"}
    else:
        return {"category": "GENERAL", "violation_type": "general_violation", "severity": "medium"}
