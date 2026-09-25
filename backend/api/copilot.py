from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from core.db.firestore_client import get_db
from agents.copilot_agent import generate_copilot_checklist

router = APIRouter()

class CopilotRequest(BaseModel):
    establishment_id: str
    complaint_id: Optional[str] = None
    inspection_context: Optional[str] = None
    detected_violations: List[str] = []
    detections: List[dict] = []

@router.post("/checklist")
async def get_copilot_checklist(req: CopilotRequest):
    db = get_db()
    
    historical_violations = []
    establishment_data = {"establishment_id": req.establishment_id, "name": f"Establishment {req.establishment_id}"}
    
    if db:
        try:
            est_doc = db.collection("establishments").document(req.establishment_id).get()
            if est_doc.exists:
                establishment_data = est_doc.to_dict()
                
            docs = db.collection("violations").where("establishment_id", "==", req.establishment_id).stream()
            for doc in docs:
                historical_violations.append(doc.to_dict())
        except Exception as e:
            print(f"Error querying Firestore in copilot: {e}")
            
    complaint = None
    if req.complaint_id:
        complaint_ref = db.collection("complaints").document(req.complaint_id) if db else None
        complaint_doc = complaint_ref.get() if complaint_ref else None
        if complaint_doc and complaint_doc.exists:
            complaint = complaint_doc.to_dict()

    current_violations = [{"violation_type": v} for v in req.detected_violations]
    inspection_context = req.inspection_context or "No additional inspector notes were supplied."
    if complaint:
        inspection_context = (
            f"Complaint {req.complaint_id}: {complaint.get('title', '')}. "
            f"Description: {complaint.get('description', '')}. "
            f"Assigned inspector: {complaint.get('assignedOfficer', 'unassigned')}. "
            f"YOLO detections: {req.detections}. Inspector notes: {inspection_context}"
        )
    
    try:
        result = generate_copilot_checklist(
            establishment_data,
            current_violations,
            historical_violations,
            inspection_context
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    
    return result
