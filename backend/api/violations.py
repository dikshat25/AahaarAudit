from fastapi import APIRouter, HTTPException
from typing import List
from core.db.firestore_client import get_db
from models.schemas import Violation, ExpertOpinion
from agents.experts.third_opinion_agent import request_third_opinion
from core.memory_store import violations_store

router = APIRouter()

@router.get("/complaint/{complaint_id}", response_model=List[Violation])
async def get_violations_by_complaint(complaint_id: str):
    db = get_db()
    results = []
    if db:
        try:
            docs = db.collection("violations").where("complaint_id", "==", complaint_id).stream()
            for doc in docs:
                data = doc.to_dict()
                results.append(data)
                violations_store[data.get("violation_id", doc.id)] = data
        except Exception as e:
            print(f"Error querying violations by complaint: {e}")
            
    # Check in-memory store
    for v in violations_store.values():
        if v.get("complaint_id") == complaint_id and not any(r.get("violation_id") == v.get("violation_id") for r in results):
            results.append(v)
            
    return results

@router.get("/{violation_id}", response_model=Violation)
async def get_violation(violation_id: str):
    db = get_db()
    if db:
        try:
            doc = db.collection("violations").document(violation_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            print(f"Error fetching violation: {e}")
            
    if violation_id in violations_store:
        return violations_store[violation_id]
        
    raise HTTPException(status_code=404, detail="Violation not found")

@router.get("/establishment/{establishment_id}", response_model=List[Violation])
async def get_violations_by_establishment(establishment_id: str):
    db = get_db()
    results = []
    if db:
        try:
            docs = db.collection("violations").where("establishment_id", "==", establishment_id).stream()
            for doc in docs:
                data = doc.to_dict()
                results.append(data)
                violations_store[data.get("violation_id", doc.id)] = data
        except Exception as e:
            print(f"Error querying violations by establishment: {e}")
            
    for v in violations_store.values():
        if v.get("establishment_id") == establishment_id and not any(r.get("violation_id") == v.get("violation_id") for r in results):
            results.append(v)
            
    return results

@router.post("/{violation_id}/third-opinion", response_model=ExpertOpinion)
async def get_third_opinion(violation_id: str):
    db = get_db()
    violation_data = None
    if db:
        try:
            ref = db.collection("violations").document(violation_id)
            doc = ref.get()
            if doc.exists:
                violation_data = doc.to_dict()
        except Exception as e:
            print(f"Error fetching violation for third opinion: {e}")
            
    if not violation_data and violation_id in violations_store:
        violation_data = violations_store[violation_id]
        
    if not violation_data:
        raise HTTPException(status_code=404, detail="Violation not found")
        
    expert_opinion = request_third_opinion(violation_data)
    
    opinions = violation_data.get("expert_opinions", [])
    opinions.append(expert_opinion)
    violation_data["expert_opinions"] = opinions
    violations_store[violation_id] = violation_data
    
    if db:
        try:
            ref = db.collection("violations").document(violation_id)
            ref.update({"expert_opinions": opinions})
        except Exception as e:
            print(f"Error saving expert opinion: {e}")
            
    return expert_opinion

    ref.update({"expert_opinions": opinions})
    
    return expert_opinion
