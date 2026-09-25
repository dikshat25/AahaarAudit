from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import random
import hashlib
from core.db.firestore_client import get_db
from core.scoring import calculate_scorecard

router = APIRouter()

class ComplaintCreate(BaseModel):
    model_config = ConfigDict(extra="allow")

    establishmentId: str
    establishmentName: Optional[str] = ""
    category: str
    title: str
    description: str
    productInvolved: Optional[str] = ""
    orderRef: Optional[str] = ""
    location: Optional[str] = ""
    dateTime: Optional[str] = ""
    userId: Optional[str] = ""
    userEmail: Optional[str] = ""
    ownerEmail: Optional[str] = ""

class ComplaintUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")
    status: Optional[str] = None
    assignedOfficer: Optional[str] = None
    inspectionNotes: Optional[str] = None
    acknowledgement: Optional[Dict[str, Any]] = None
    correctiveAction: Optional[Dict[str, Any]] = None

# In-memory storage cache
complaints_cache: Dict[str, Any] = {}

@router.post("/")
async def create_complaint(req: ComplaintCreate):
    db = get_db()
    
    complaint_id = f"CMP-{random.randint(10000, 99999)}"
    now_iso = datetime.now().isoformat()
    
    establishment_id = req.establishmentId
    if not establishment_id or establishment_id.startswith("AUTO-"):
        identity = f"{req.establishmentName}|{req.location}".strip().lower()
        establishment_id = f"REST-{hashlib.sha1(identity.encode()).hexdigest()[:8].upper()}"

    owner_email = req.ownerEmail or ""
    est_name = req.establishmentName or ""
    
    if db and (not owner_email or not est_name):
        try:
            est_doc = db.collection("establishments").document(establishment_id).get()
            if est_doc.exists:
                est_data = est_doc.to_dict()
                if not owner_email:
                    owner_email = est_data.get("owner_email", "")
                if not est_name:
                    est_name = est_data.get("name", "")
        except Exception as e:
            print("Error looking up establishment for owner email:", e)
            
    # Priority triage
    priority = "Medium"
    desc_lower = (req.description + " " + req.title).lower()
    if any(w in desc_lower for w in ["maggot", "cockroach", "poison", "hospital", "dead", "blood", "vomit"]):
        priority = "Critical"
    elif any(w in desc_lower for w in ["stale", "smell", "rotten", "hair", "raw", "expired"]):
        priority = "High"

    timeline = [
        {"label": "Complaint Lodged", "date": now_iso, "done": True},
        {"label": "Automated AI Priority Triage", "date": now_iso, "done": True},
        {"label": "Assigned to Municipal Inspector", "date": now_iso, "done": True},
        {"label": "Live Camera / Vision Inspection", "date": "Pending Inspector Review", "done": False},
        {"label": "Final Regulatory Resolution", "date": "Pending", "done": False},
    ]

    record = {
        "id": complaint_id,
        "establishmentId": establishment_id,
        "establishment": est_name or f"Establishment {req.establishmentId}",
        "category": req.category,
        "title": req.title,
        "description": req.description,
        "productInvolved": req.productInvolved,
        "orderRef": req.orderRef,
        "location": req.location or "Mumbai, Maharashtra",
        "priority": priority,
        "status": "Under Investigation",
        "submittedAt": now_iso,
        "lastUpdated": now_iso,
        "assignedOfficer": "Inspector R. Deshmukh (Zone 4)",
        "timeline": timeline,
        "userId": req.userId,
        "userEmail": req.userEmail,
        "ownerEmail": owner_email,
        "inspectionRequired": True,
        "report": None,
        "scorecard": None,
        "createdInFirestore": True,
    }

    complaints_cache[complaint_id] = record

    if db:
        try:
            db.collection("complaints").document(complaint_id).set(record)
            
            # Create a corresponding alert in alerts collection
            alert_id = f"ALERT-{str(uuid.uuid4())[:8]}"
            alert_data = {
                "alert_id": alert_id,
                "violation_id": complaint_id,
                "establishment_id": establishment_id,
                "severity": priority.lower(),
                "message": f"Customer Complaint: {req.title} ({priority} Priority)",
                "status": "unread",
                "timestamp": now_iso
            }
            db.collection("alerts").document(alert_id).set(alert_data)
        except Exception as e:
            print(f"Error persisting complaint to Firestore: {e}")

    return record

@router.get("/")
async def list_complaints(
    user_id: Optional[str] = None,
    user_email: Optional[str] = None,
    establishment_id: Optional[str] = None,
    owner_email: Optional[str] = None
):
    db = get_db()
    complaints = []
    
    if db:
        try:
            ref = db.collection("complaints")
            if establishment_id:
                ref = ref.where("establishmentId", "==", establishment_id)
            if owner_email:
                ref = ref.where("ownerEmail", "==", owner_email)
            docs = ref.stream()
            for doc in docs:
                data = doc.to_dict()
                if data.get("status") != "Dismissed":
                    complaints.append(data)
                complaints_cache[data.get("id")] = data
        except Exception as e:
            print(f"Error fetching complaints from Firestore: {e}")

    if not complaints:
        complaints = [c for c in complaints_cache.values() if c.get("status") != "Dismissed"]
        if establishment_id:
            complaints = [c for c in complaints if c.get("establishmentId") == establishment_id]
        if owner_email:
            complaints = [c for c in complaints if c.get("ownerEmail") == owner_email]

    # Filter for customer view if user_id or user_email is provided and not admin
    if user_email and user_email.lower() != "admin@gmail.com":
        complaints = [
            c for c in complaints
            if (c.get("userEmail") and c.get("userEmail").lower() == user_email.lower()) or
               (c.get("userId") and user_id and c.get("userId") == user_id)
        ]
    elif user_id and not user_email:
        complaints = [c for c in complaints if c.get("userId") == user_id]

    return complaints

@router.get("/{complaint_id}")
async def get_complaint(complaint_id: str):
    db = get_db()
    
    if db:
        try:
            doc = db.collection("complaints").document(complaint_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            print(f"Error reading complaint: {e}")
            
    if complaint_id in complaints_cache:
        return complaints_cache[complaint_id]
        
    raise HTTPException(status_code=404, detail="Complaint not found")

@router.patch("/{complaint_id}")
async def update_complaint(complaint_id: str, req: ComplaintUpdate):
    db = get_db()
    complaint = complaints_cache.get(complaint_id)

    if db:
        try:
            doc = db.collection("complaints").document(complaint_id).get()
            if doc.exists:
                complaint = doc.to_dict()
        except Exception as e:
            print(f"Error reading complaint for update: {e}")

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    changes = req.model_dump(exclude_none=True)
    changes["lastUpdated"] = datetime.now().isoformat()
    complaint.update(changes)
    complaints_cache[complaint_id] = complaint

    if db:
        try:
            db.collection("complaints").document(complaint_id).set(changes, merge=True)
        except Exception as e:
            print(f"Error persisting complaint update: {e}")

    return complaint

@router.post("/{complaint_id}/live-inspection")
async def trigger_live_inspection(complaint_id: str):
    """Marks live camera inspection as completed for this complaint."""
    db = get_db()
    complaint = complaints_cache.get(complaint_id)

    now_iso = datetime.now().isoformat()

    if db:
        try:
            doc = db.collection("complaints").document(complaint_id).get()
            if doc.exists:
                complaint = doc.to_dict()
        except Exception as e:
            print(e)

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    timeline = complaint.get("timeline", [])
    for step in timeline:
        if "Live Camera" in step.get("label", "") or "Camera" in step.get("label", ""):
            step["done"] = True
            step["date"] = now_iso

    priority_violation = {
        "violation_type": complaint.get("category", "general").lower().replace(" ", "_"),
        "category": complaint.get("category", "GENERAL"),
        "severity": complaint.get("priority", "Medium").lower(),
        "status": "open",
        "detected_at": now_iso,
    }
    scorecard = calculate_scorecard(complaint.get("establishmentId", ""), [priority_violation])
    scorecard["grade"] = "A" if scorecard["overall_score"] >= 80 else "B" if scorecard["overall_score"] >= 60 else "C"
    scorecard.update({
        "complaint_id": complaint_id,
        "establishment_id": complaint.get("establishmentId"),
        "owner_email": complaint.get("ownerEmail") or complaint.get("owner_email"),
        "updated_at": now_iso,
        "risk_level": complaint.get("priority", "Medium").lower(),
        "summary": "Live vision audit completed and a corrective notice has been issued."
    })

    report_lines = [
        f"Complaint ID: {complaint_id}",
        f"Establishment: {complaint.get('establishment') or complaint.get('establishmentName') or complaint.get('establishmentId')}",
        f"Owner Email: {complaint.get('ownerEmail') or complaint.get('owner_email') or 'not-linked'}",
        f"Assigned Officer: {complaint.get('assignedOfficer') or 'Inspector Unassigned'}",
        f"Category: {complaint.get('category') or 'General'}",
        f"Title: {complaint.get('title') or 'Inspection report'}",
        f"Status: Inspection Completed",
        f"Score: {scorecard['overall_score']} | Grade: {scorecard['grade']}",
        "Summary: Live vision review confirms operational non-compliance, and the owner has been linked for corrective action.",
    ]

    complaint["timeline"] = timeline
    complaint["status"] = "Inspection Completed"
    complaint["lastUpdated"] = now_iso
    complaint["inspectionNotes"] = "CCTV camera inspection stream verified by Inspector."
    complaint["scorecard"] = scorecard
    complaint["report"] = "\n".join(report_lines)

    complaints_cache[complaint_id] = complaint
    if db:
        try:
            db.collection("complaints").document(complaint_id).set(complaint, merge=True)
        except Exception as e:
            print(e)

    return complaint

@router.get("/{complaint_id}/report")
async def get_complaint_report(complaint_id: str):
    db = get_db()
    complaint = complaints_cache.get(complaint_id)

    if db:
        try:
            doc = db.collection("complaints").document(complaint_id).get()
            if doc.exists:
                complaint = doc.to_dict()
        except Exception as e:
            print(e)

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    report_text = complaint.get("report") or (
        f"Complaint ID: {complaint_id}\n"
        f"Establishment: {complaint.get('establishment') or complaint.get('establishmentId')}\n"
        f"Owner Email: {complaint.get('ownerEmail') or 'not-linked'}\n"
        f"Status: {complaint.get('status') or 'unknown'}"
    )

    return {"complaint_id": complaint_id, "report_id": complaint.get("report_id"), "scorecard_id": complaint.get("scorecard_id"), "report": report_text, "scorecard": complaint.get("scorecard")}

@router.get("/{complaint_id}/scorecard")
async def get_complaint_scorecard(complaint_id: str):
    db = get_db()
    complaint = complaints_cache.get(complaint_id)

    if db:
        try:
            doc = db.collection("complaints").document(complaint_id).get()
            if doc.exists:
                complaint = doc.to_dict()
        except Exception as e:
            print(e)

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    scorecard = complaint.get("scorecard") or {
        "complaint_id": complaint_id,
        "establishment_id": complaint.get("establishmentId"),
        "owner_email": complaint.get("ownerEmail") or complaint.get("owner_email"),
        "overall_score": 100,
        "grade": "A",
        "updated_at": complaint.get("lastUpdated")
    }

    return scorecard
