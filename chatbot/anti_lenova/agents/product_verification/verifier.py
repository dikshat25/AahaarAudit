import json
import os
from datetime import datetime, timedelta
from .explainer import generate_explanation

def check_expiry(expiry_date: str) -> dict:
    try:
        exp_dt = datetime.strptime(expiry_date, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError(f"Invalid date format: {expiry_date}. Expected YYYY-MM-DD.")
    
    today = datetime.now().date()
    days_remaining = (exp_dt - today).days
    
    if days_remaining < 0:
        status = "expired"
    elif days_remaining <= 7:
        status = "expiring_soon"
    else:
        status = "valid"
        
    return {"status": status, "days_remaining": days_remaining}

def check_supplier(supplier_name: str) -> dict:
    config_path = os.path.join(os.path.dirname(__file__), '..', '..', 'config', 'approved_suppliers.json')
    try:
        with open(config_path, 'r') as f:
            suppliers = json.load(f)
    except FileNotFoundError:
        suppliers = []
        
    supplier_name_lower = supplier_name.lower()
    
    for supplier in suppliers:
        if supplier.get("supplier_name", "").lower() == supplier_name_lower:
            return {"status": "registered", "matched_entry": supplier}
            
    return {"status": "unregistered_supplier", "matched_entry": None}

def check_completeness(payload: dict) -> dict:
    required_fields = [
        "kitchen_id", "barcode", "product_name", "brand", 
        "manufacture_date", "expiry_date", "supplier_name", 
        "batch_number", "scanned_at"
    ]
    
    missing_fields = []
    for field in required_fields:
        if field not in payload or not payload[field]:
            missing_fields.append(field)
            
    if missing_fields:
        return {"status": "incomplete_data", "missing_fields": missing_fields}
        
    return {"status": "complete", "missing_fields": []}

def verify_product(payload: dict) -> dict:
    completeness_result = check_completeness(payload)
    if completeness_result["status"] == "incomplete_data":
        details = {"completeness": completeness_result}
        flags = ["incomplete_data"]
        return {
            "status": "flagged",
            "flags": flags,
            "details": details,
            "explanation": generate_explanation(flags, details, payload)
        }
        
    expiry_result = check_expiry(payload["expiry_date"])
    supplier_result = check_supplier(payload["supplier_name"])
    
    flags = []
    if expiry_result["status"] != "valid":
        flags.append(expiry_result["status"])
    if supplier_result["status"] != "registered":
        flags.append(supplier_result["status"])
        
    status = "flagged" if flags else "clear"
    
    details = {
        "expiry": expiry_result,
        "supplier": supplier_result,
        "completeness": completeness_result
    }
    
    return {
        "status": status,
        "flags": flags,
        "details": details,
        "explanation": generate_explanation(flags, details, payload)
    }
