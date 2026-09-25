from fastapi import APIRouter, HTTPException
from core.db.firestore_client import get_db
from core.scoring import calculate_scorecard
from models.schemas import Scorecard
from core.memory_store import scorecards_store, violations_store
from .complaints import complaints_cache

router = APIRouter()

@router.get("/id/{scorecard_id}")
async def get_scorecard_by_id(scorecard_id: str):
    db = get_db()
    if db:
        try:
            doc = db.collection("scorecards").document(scorecard_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            print(f"Error fetching scorecard by ID: {e}")
            
    if scorecard_id in scorecards_store:
        return scorecards_store[scorecard_id]
        
    raise HTTPException(status_code=404, detail="Scorecard not found")

@router.get("/complaint/{complaint_id}")
async def get_scorecard_by_complaint(complaint_id: str):
    db = get_db()
    if db:
        try:
            complaint = db.collection("complaints").document(complaint_id).get()
            if complaint.exists and complaint.to_dict().get("scorecard"):
                return complaint.to_dict()["scorecard"]
            docs = db.collection("scorecards").where("complaint_id", "==", complaint_id).limit(1).stream()
            for doc in docs:
                return doc.to_dict()
        except Exception as e:
            print(f"Error fetching complaint scorecard: {e}")
            
    # Check complaints_cache
    if complaint_id in complaints_cache and complaints_cache[complaint_id].get("scorecard"):
        return complaints_cache[complaint_id]["scorecard"]
        
    # Check scorecards_store
    for s in scorecards_store.values():
        if s.get("complaint_id") == complaint_id:
            return s
            
    # If there are violations recorded for this complaint, compute scorecard on the fly
    complaint_violations = [v for v in violations_store.values() if v.get("complaint_id") == complaint_id]
    if complaint_violations:
        est_id = complaint_violations[0].get("establishment_id", "UNKNOWN")
        computed = calculate_scorecard(est_id, complaint_violations)
        computed["complaint_id"] = complaint_id
        computed["grade"] = "A" if computed["overall_score"] >= 80 else "B" if computed["overall_score"] >= 60 else "C"
        return computed

    raise HTTPException(status_code=404, detail="Scorecard not found for complaint")

@router.get("/{establishment_id}", response_model=Scorecard)
async def get_establishment_scorecard(establishment_id: str):
    db = get_db()
    violations = []
    if db:
        try:
            docs = db.collection("violations").where("establishment_id", "==", establishment_id).stream()
            for doc in docs:
                violations.append(doc.to_dict())
        except Exception as e:
            print(f"Error fetching violations for scorecard: {e}")
            
    for v in violations_store.values():
        if v.get("establishment_id") == establishment_id and not any(r.get("violation_id") == v.get("violation_id") for r in violations):
            violations.append(v)
            
    scorecard = calculate_scorecard(establishment_id, violations)
    return scorecard

