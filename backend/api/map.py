from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from core.db.firestore_client import get_db

router = APIRouter()

@router.get("/violations")
async def get_map_violations():
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="DB not initialized")
        
    locations = []
    
    # Get establishments
    docs = db.collection("establishments").stream()
    for doc in docs:
        est = doc.to_dict()
        est_id = est.get("establishment_id")
        
        # Get active violations count and highest severity
        violations_query = db.collection("violations").where("establishment_id", "==", est_id).where("status", "==", "open").stream()
        
        active_count = 0
        highest_severity = "low"
        latest_violation_id = None
        
        severity_levels = {"critical": 4, "high": 3, "medium": 2, "low": 1}
        current_max_severity_val = 0
        
        for vdoc in violations_query:
            v = vdoc.to_dict()
            active_count += 1
            latest_violation_id = v.get("violation_id")
            sev = v.get("severity", "low").lower()
            if severity_levels.get(sev, 1) > current_max_severity_val:
                current_max_severity_val = severity_levels.get(sev, 1)
                highest_severity = sev
                
        loc = est.get("location", {"latitude": 0, "longitude": 0})
        if loc:
            locations.append({
                "establishment_id": est_id,
                "name": est.get("name"),
                "latitude": loc.get("latitude", 0),
                "longitude": loc.get("longitude", 0),
                "risk_score": est.get("risk_score", 0),
                "active_violation_count": active_count,
                "highest_severity": highest_severity,
                "latest_violation_id": latest_violation_id
            })
            
    return {"locations": locations}
