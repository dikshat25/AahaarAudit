from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.schemas import Alert
from core.db.firestore_client import get_db

router = APIRouter()

@router.get("/", response_model=List[Alert])
async def get_alerts(establishment_id: Optional[str] = None):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="DB not initialized")
    
    query = db.collection("alerts")
    if establishment_id:
        query = query.where("establishment_id", "==", establishment_id)
        
    docs = query.stream()
    return [doc.to_dict() for doc in docs]

@router.get("/{alert_id}", response_model=Alert)
async def get_alert(alert_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="DB not initialized")
        
    doc = db.collection("alerts").document(alert_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    return doc.to_dict()

@router.patch("/{alert_id}", response_model=Alert)
async def update_alert(alert_id: str, status: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="DB not initialized")
        
    ref = db.collection("alerts").document(alert_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    ref.update({"status": status})
    updated_doc = ref.get().to_dict()
    return updated_doc
