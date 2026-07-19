import os
import sys
import uuid
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Add chatbot directory to path to import friend's modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "chatbot", "anti_lenova")))
from chatbot_service.chatbot import answer_question
from agents.product_verification.verifier import verify_product

from core.db.firestore_client import get_db
from agents.vision_inspection.vision_agent import VisionAgent
from agents.rule_engine.rule_agent import RuleEngine
from agents.compliance_debate.coordinator import coordinate_debate
from agents.risk_scoring.risk_agent import score_event
from agents.scheduling.schedule_agent import rank_kitchens

router = APIRouter()

# Initialize agents
vision_agent = VisionAgent()
rule_engine = RuleEngine()

# Ensure temp directory exists for uploads
os.makedirs("temp_uploads", exist_ok=True)

@router.post("/ingest-frame")
async def ingest_frame(kitchen_id: str = Form(...), file: UploadFile = File(...)):
    db = get_db()
    if not db:
        print("Warning: Database not initialized. Results will not be saved.")

    # Save uploaded file temporarily
    file_path = os.path.join("temp_uploads", file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # 1. Vision Agent Detects
    detections = vision_agent.detect_frame(file_path)
    
    # Optional: check proximity (e.g. Person and specific objects or raw/cooked food)
    proximity_violations = [] # Mocked or added logic if Food-101 was here
    
    # 2. Rule Engine Evaluates
    rule_eval = rule_engine.evaluate_detections(detections, proximity_violations)
    
    status = rule_eval["status"]
    matched_rules = rule_eval["matched_rules"]
    
    event_id = str(uuid.uuid4())
    debate_id = None
    final_verdict = status
    final_confidence = rule_eval["confidence"]
    justification = "Deterministic rule matched."

    # 3. Auto-escalate to debate if ambiguous or severe
    # We consider it severe if multiple rules are broken, or a critical rule is broken
    is_severe = score_event(matched_rules) >= 4.0
    
    if status == "ambiguous" or is_severe:
        context = f"Kitchen ID: {kitchen_id}. Rule Engine flagged as {status}."
        facts = f"Detections: {detections}. Matched Rules: {matched_rules}"
        
        debate_result = coordinate_debate(context, facts)
        
        debate_id = str(uuid.uuid4())
        final_verdict = debate_result["final_verdict"]
        final_confidence = debate_result["final_confidence"]
        justification = debate_result["justification"]
        
        # Save debate log to Firestore
        if db:
            db.collection("debate_logs").document(debate_id).set({
                "id": debate_id,
                "event_id": event_id,
                "transcript": debate_result["transcript"],
                "agreement_score": debate_result["agreement_score"],
                "rounds": debate_result["rounds"],
                "final_verdict": final_verdict,
                "final_confidence": final_confidence,
                "justification": justification
            })
        
    # Calculate Risk Score
    risk_score = score_event(matched_rules)
    
    # Save Event to Firestore
    event_data = {
        "id": event_id,
        "kitchen_id": kitchen_id,
        "status": final_verdict,
        "confidence": final_confidence,
        "matched_rules": matched_rules,
        "detections": detections,
        "debate_id": debate_id,
        "risk_score": risk_score,
        "justification": justification
    }
    
    # Also attach transcript to the response for easy testing without DB
    if status == "ambiguous" or is_severe:
        event_data["transcript"] = debate_result["transcript"]
    
    if db:
        db.collection("events").document(event_id).set(event_data)
        
        # Update Kitchen risk score
        kitchen_ref = db.collection("kitchens").document(kitchen_id)
        kitchen_doc = kitchen_ref.get()
        
        if kitchen_doc.exists:
            current_score = kitchen_doc.to_dict().get("risk_score", 0.0)
            kitchen_ref.update({"risk_score": current_score + risk_score})
        else:
            kitchen_ref.set({
                "id": kitchen_id,
                "name": f"Kitchen {kitchen_id}",
                "location": "Unknown",
                "risk_score": risk_score
            })

    # Cleanup temp file
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except PermissionError:
            print(f"Warning: Could not delete temp file {file_path} because it's locked by another process.")
        except Exception as e:
            print(f"Warning: Failed to delete temp file {file_path}: {e}")
        
    return {"message": "Frame processed", "event": event_data}

@router.get("/debate-log/{violation_id}")
async def get_debate_log(violation_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
        
    # Search for an event with this debate ID, or just search the debate_logs collection directly
    doc = db.collection("debate_logs").document(violation_id).get()
    if doc.exists:
        return doc.to_dict()
    
    raise HTTPException(status_code=404, detail="Debate log not found")

@router.get("/rankings")
async def get_rankings():
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
        
    kitchens = []
    docs = db.collection("kitchens").stream()
    for doc in docs:
        kitchens.append(doc.to_dict())
        
    ranked = rank_kitchens(kitchens)
    return {"rankings": ranked}

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    reply = answer_question(req.message)
    return {"reply": reply}

class VerifyRequest(BaseModel):
    kitchen_id: str
    barcode: str
    product_name: str
    brand: str
    manufacture_date: str
    expiry_date: str
    supplier_name: str
    batch_number: str
    scanned_at: str

@router.post("/verify")
async def verify_endpoint(req: VerifyRequest):
    # Use model_dump for Pydantic v2 or dict() for v1. model_dump is safer if available, else dict
    try:
        payload = req.model_dump()
    except AttributeError:
        payload = req.dict()
        
    result = verify_product(payload)
    return result
