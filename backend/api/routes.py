import os
import sys
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
import json
from pydantic import BaseModel

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "chatbot", "anti_lenova")))
from chatbot_service.chatbot import answer_question
from agents.product_verification.verifier import verify_product

from core.db.firestore_client import get_db
from agents.vision_inspection.vision_agent import VisionAgent
from agents.rule_engine.rule_agent import RuleEngine
from agents.compliance_debate.coordinator import coordinate_debate
from agents.compliance_debate.debate_graph import stream_debate_graph
from agents.scheduling.schedule_agent import rank_kitchens
from core.normalization import normalize_violation
from core.scoring import calculate_scorecard
from core.memory_store import violations_store, reports_store, scorecards_store, debate_logs_store

from .alerts import router as alerts_router
from .scorecards import router as scorecards_router
from .violations import router as violations_router
from .map import router as map_router
from .copilot import router as copilot_router
from .auth import router as auth_router
from .complaints import router as complaints_router, complaints_cache

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["Auth"])
router.include_router(alerts_router, prefix="/alerts", tags=["Alerts"])
router.include_router(scorecards_router, prefix="/scorecards", tags=["Scorecards"])
router.include_router(violations_router, prefix="/violations", tags=["Violations"])
router.include_router(map_router, prefix="/map", tags=["Map"])
router.include_router(copilot_router, prefix="/inspection-copilot", tags=["Copilot"])
router.include_router(complaints_router, prefix="/complaints", tags=["Complaints"])

vision_agent = VisionAgent()
rule_engine = RuleEngine()

os.makedirs("temp_uploads", exist_ok=True)

def build_inspection_scorecard(establishment_id: str, violations: list) -> dict:
    scorecard = calculate_scorecard(establishment_id, violations)
    score = scorecard["overall_score"]
    scorecard["grade"] = "A" if score >= 80 else "B" if score >= 60 else "C"
    return scorecard

def build_frame_violation(final_establishment_id: str, rule_eval: dict, debate: Optional[dict]) -> dict:
    verdict = (debate or {}).get("final_verdict", "clear")
    is_violation = verdict == "violation" or rule_eval.get("status") == "violation"
    return {
        "violation_type": ", ".join(rule_eval.get("matched_rules", [])) or "vision_review",
        "category": "GENERAL",
        "severity": "high" if is_violation else "low",
        "status": "open" if is_violation else "resolved",
        "detected_at": datetime.now().isoformat(),
        "establishment_id": final_establishment_id,
    }

def persist_complaint_artifacts(complaint_context: Optional[dict], scorecard: dict, report: str, now_iso: str, debate: Optional[dict] = None) -> None:
    if not complaint_context:
        return
    complaint_context["scorecard"] = scorecard
    complaint_context["report"] = report
    complaint_context["status"] = "Inspection Completed"
    complaint_context["lastUpdated"] = now_iso
    complaints_cache[complaint_context.get("id")] = complaint_context
    db = get_db()
    report_id = f"REPORT-{str(uuid.uuid4())[:8]}"
    scorecard_id = f"SCORE-{str(uuid.uuid4())[:8]}"
    complaint_context["report_id"] = report_id
    complaint_context["scorecard_id"] = scorecard_id
    
    transcript = (debate or {}).get("transcript") or []
    report_record = {
        "id": report_id,
        "complaint_id": complaint_context["id"],
        "establishment_id": complaint_context.get("establishmentId"),
        "facility": complaint_context.get("establishment") or complaint_context.get("establishmentName") or complaint_context.get("establishmentId"),
        "date": now_iso,
        "type": "Live Vision Inspection",
        "summary": report,
        "scorecard": scorecard,
        "transcript": transcript,
        "debate": debate,
        "status": "Generated"
    }
    scorecard_record = {"id": scorecard_id, "complaint_id": complaint_context["id"], **scorecard}
    reports_store[report_id] = report_record
    scorecards_store[scorecard_id] = scorecard_record
    if db and complaint_context.get("id"):
        db.collection("complaints").document(complaint_context["id"]).set({
            "scorecard": scorecard,
            "report": report,
            "report_id": report_id,
            "scorecard_id": scorecard_id,
            "status": "Inspection Completed",
            "lastUpdated": now_iso,
        }, merge=True)
        db.collection("reports").document(report_id).set(report_record)
        db.collection("scorecards").document(scorecard_id).set(scorecard_record)

@router.post("/ingest-frame")
async def ingest_frame(
    establishment_id: str = Form(...),
    kitchen_id: Optional[str] = Form(None),
    complaint_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
):
    # Fallback to establishment_id if kitchen_id is used by old clients
    final_establishment_id = establishment_id or kitchen_id
    
    db = get_db()
    if not db:
        print("Warning: Database not initialized.")

    file_path = os.path.join("temp_uploads", file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    detections = vision_agent.detect_frame(file_path)
    rule_eval = rule_engine.evaluate_detections(detections, [])

    status = rule_eval["status"]
    matched_rules = rule_eval["matched_rules"]
    overall_confidence = rule_eval["confidence"]
    
    complaint_context = None
    if complaint_id:
        complaint_doc = db.collection("complaints").document(complaint_id).get() if db else None
        if complaint_doc and complaint_doc.exists:
            complaint_context = complaint_doc.to_dict()
        if complaint_context is None:
            complaint_context = complaints_cache.get(complaint_id)

    frame_debate = None
    debate_error = None
    if status == "clear" or status == "no_subject":
        if complaint_context:
            debate_context = (
                f"Establishment: {complaint_context.get('establishment', final_establishment_id)}. "
                f"Complaint ID: {complaint_id}. Category: {complaint_context.get('category', 'unknown')}. "
                f"Title: {complaint_context.get('title', 'unknown')}."
            )
            debate_facts = (
                f"Complaint description: {complaint_context.get('description', 'not available')}. "
                f"Assigned inspector: {complaint_context.get('assignedOfficer', 'not assigned')}. "
                f"YOLO detections: {detections}. Rule evaluation: {rule_eval}."
            )
            try:
                frame_debate = coordinate_debate(debate_context, debate_facts)
            except RuntimeError as exc:
                debate_error = str(exc)
        frame_violation = build_frame_violation(final_establishment_id, rule_eval, frame_debate)
        scorecard = build_inspection_scorecard(final_establishment_id, [frame_violation])
        now_iso = datetime.now().isoformat()
        report = (
            f"Complaint ID: {complaint_id or 'unlinked'}\n"
            f"Establishment: {complaint_context.get('establishment', final_establishment_id) if complaint_context else final_establishment_id}\n"
            f"YOLO detections: {len(detections)}\nRule status: {status}\n"
            f"Verdict: {frame_debate.get('final_verdict', 'review') if frame_debate else 'review'}\n"
            f"Score: {scorecard['overall_score']} | Grade: {scorecard['grade']}"
        )
        persist_complaint_artifacts(complaint_context, scorecard, report, now_iso, debate=frame_debate)
        if os.path.exists(file_path):
            os.remove(file_path)
        return {"message": "Frame processed", "status": status, "detections": detections, "rule_evaluation": rule_eval, "complaint": complaint_context, "debate": frame_debate, "debate_error": debate_error, "scorecard": scorecard, "report": report}
        
    created_violations = []
    debate_result = None
    
    for rule in matched_rules:
        # 1. Normalize
        norm = normalize_violation(rule)
        
        viol_id = f"VIOL-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
        debate_id = None
        final_verdict = "violation"
        justification = rule
        
        # Debate check
        is_severe = norm["severity"] in ["high", "critical"]
        if complaint_context or status == "ambiguous" or is_severe:
            context = (
                f"Establishment: {complaint_context.get('establishment') if complaint_context else final_establishment_id}. "
                f"Complaint ID: {complaint_id or 'not linked'}. "
                f"Complaint category: {complaint_context.get('category', 'unknown') if complaint_context else 'unknown'}. "
                f"Complaint title: {complaint_context.get('title', 'unknown') if complaint_context else 'unknown'}. "
                f"Rule Engine flagged as {status}. Category: {norm['category']}."
            )
            facts = (
                f"Complaint description: {complaint_context.get('description', 'not available') if complaint_context else 'not available'}. "
                f"Assigned inspector: {complaint_context.get('assignedOfficer', 'not assigned') if complaint_context else 'not assigned'}. "
                f"YOLO detections: {detections}. Matched rule: {rule}"
            )
            
            try:
                debate_result = coordinate_debate(context, facts)
            except RuntimeError as exc:
                debate_error = str(exc)
            if debate_result:
                debate_id = str(uuid.uuid4())
                final_verdict = debate_result["final_verdict"]
                justification = debate_result["justification"]
            
            if db and debate_result:
                db.collection("debate_logs").document(debate_id).set({
                    "id": debate_id,
                    "violation_id": viol_id,
                    "transcript": debate_result["transcript"],
                    "agreement_score": debate_result["agreement_score"],
                    "rounds": debate_result["rounds"],
                    "final_verdict": final_verdict,
                    "final_confidence": debate_result["final_confidence"],
                    "justification": justification
                })
        
        evidence_id = f"EVID-{str(uuid.uuid4())[:8]}"
        evidence = {
            "evidence_id": evidence_id,
            "type": "image",
            "file_path": file_path, # In real system, this would be a cloud storage URL
            "detections": detections,
            "timestamp": datetime.now().isoformat()
        }
        
        violation_record = {
            "violation_id": viol_id,
            "establishment_id": final_establishment_id,
            "establishment_name": complaint_context.get("establishment", f"Establishment {final_establishment_id}") if complaint_context else f"Establishment {final_establishment_id}",
            "detected_at": datetime.now().isoformat(),
            "violation_type": norm["violation_type"],
            "category": norm["category"],
            "severity": norm["severity"],
            "confidence": overall_confidence,
            "source": "vision",
            "status": "open" if final_verdict == "violation" else "resolved",
            "evidence": [evidence],
            "ai_decision": {
                "debate_id": debate_id,
                "justification": justification,
                "final_verdict": final_verdict,
                "transcript": debate_result.get("transcript", []) if debate_id else [],
            },
            "human_review": {},
            "expert_opinions": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        if complaint_context:
            violation_record["complaint_id"] = complaint_id
            violation_record["complaint_context"] = {
                "title": complaint_context.get("title"),
                "description": complaint_context.get("description"),
                "category": complaint_context.get("category"),
                "assignedOfficer": complaint_context.get("assignedOfficer"),
            }
        created_violations.append(violation_record)
        
        if db:
            db.collection("violations").document(viol_id).set(violation_record)
            
            # Generate alert if it's a violation
            if final_verdict == "violation":
                alert_id = f"ALERT-{str(uuid.uuid4())[:8]}"
                alert_record = {
                    "alert_id": alert_id,
                    "violation_id": viol_id,
                    "establishment_id": final_establishment_id,
                    "severity": norm["severity"],
                    "message": f"Detected {norm['violation_type']} ({norm['category']})",
                    "status": "unread",
                    "timestamp": datetime.now().isoformat()
                }
                db.collection("alerts").document(alert_id).set(alert_record)

    scorecard = build_inspection_scorecard(final_establishment_id, created_violations)
    debate_decision = None
    if created_violations:
        debate_decision = created_violations[0].get("ai_decision", {})
    now_iso = datetime.now().isoformat()
    report = (
        f"Complaint ID: {complaint_id or 'unlinked'}\n"
        f"Establishment: {complaint_context.get('establishment', final_establishment_id) if complaint_context else final_establishment_id}\n"
        f"YOLO detections: {len(detections)}\nMatched rules: {', '.join(matched_rules) or 'none'}\n"
        f"Verdict: {debate_decision.get('final_verdict', 'review') if debate_decision else 'review'}\n"
        f"Score: {scorecard['overall_score']} | Grade: {scorecard['grade']}\n"
        f"Reason: {debate_decision.get('justification', 'Rule evaluation requires review.') if debate_decision else 'Rule evaluation requires review.'}"
    )
    persist_complaint_artifacts(complaint_context, scorecard, report, now_iso, debate=debate_result or (debate_decision and {"transcript": debate_decision.get("transcript", []), "final_verdict": debate_decision.get("final_verdict"), "justification": debate_decision.get("justification")}))

    # Update Establishment and Risk Score
    if db and created_violations:
        est_ref = db.collection("establishments").document(final_establishment_id)
        est_doc = est_ref.get()
        if not est_doc.exists:
            est_ref.set({
                "establishment_id": final_establishment_id,
                "name": f"Establishment {final_establishment_id}",
                "type": "restaurant",
                "risk_score": 0.0,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            })
            
        # Recompute score
        violations = []
        for doc in db.collection("violations").where("establishment_id", "==", final_establishment_id).stream():
            violations.append(doc.to_dict())
            
        scorecard = build_inspection_scorecard(final_establishment_id, violations)
        est_ref.update({"risk_score": scorecard["overall_score"], "updated_at": datetime.now().isoformat()})

    # Cleanup temp file if no violations were saved or for simplicity we just keep it if we mock cloud storage
    # os.remove(file_path)

    return {
        "message": "Frame processed",
        "violations": created_violations,
        "detections": detections,
        "rule_evaluation": rule_eval,
        "complaint": complaint_context,
        "scorecard": scorecard,
        "report": report,
        "debate_error": debate_error,
        "debate": frame_debate or (created_violations[0].get("ai_decision", {}).get("transcript") and {
            "transcript": created_violations[0]["ai_decision"]["transcript"],
            "final_verdict": created_violations[0]["ai_decision"]["final_verdict"],
            "justification": created_violations[0]["ai_decision"]["justification"],
        }),
    }

@router.post("/ingest-frame/stream")
async def ingest_frame_stream(
    establishment_id: str = Form(...),
    complaint_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
):
    db = get_db()
    file_path = os.path.join("temp_uploads", file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    detections = vision_agent.detect_frame(file_path)
    rule_eval = rule_engine.evaluate_detections(detections, [])
    complaint_context = None
    if complaint_id:
        complaint_doc = db.collection("complaints").document(complaint_id).get() if db else None
        if complaint_doc and complaint_doc.exists:
            complaint_context = complaint_doc.to_dict()
        complaint_context = complaint_context or complaints_cache.get(complaint_id)

    def encode(payload):
        return f"data: {json.dumps(payload, default=str)}\n\n"

    def generate():
        yield encode({"type": "yolo", "detections": detections, "rule_evaluation": rule_eval, "complaint": complaint_context})
        context = f"Establishment: {complaint_context.get('establishment', establishment_id) if complaint_context else establishment_id}. Complaint ID: {complaint_id or 'not linked'}. Category: {complaint_context.get('category', 'unknown') if complaint_context else 'unknown'}. Title: {complaint_context.get('title', 'unknown') if complaint_context else 'unknown'}."
        facts = f"Complaint description: {complaint_context.get('description', 'not available') if complaint_context else 'not available'}. Assigned inspector: {complaint_context.get('assignedOfficer', 'not assigned') if complaint_context else 'not assigned'}. YOLO detections: {detections}. Rule evaluation: {rule_eval}."
        debate = None
        try:
            for item in stream_debate_graph(context, facts):
                if item["type"] == "debate_complete":
                    debate = item["debate"]
                else:
                    yield encode(item)
        except RuntimeError as exc:
            yield encode({"type": "debate_error", "error": str(exc)})

        violation_ids = []
        created_violations = []
        for rule in rule_eval.get("matched_rules") or ["vision_review"]:
            norm = normalize_violation(rule)
            violation_id = f"VIOL-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
            verdict = (debate or {}).get("final_verdict", "clear")
            record = {
                "violation_id": violation_id, "complaint_id": complaint_id,
                "establishment_id": establishment_id,
                "establishment_name": complaint_context.get("establishment", establishment_id) if complaint_context else establishment_id,
                "detected_at": datetime.now().isoformat(), "violation_type": norm["violation_type"],
                "category": norm["category"], "severity": norm["severity"],
                "confidence": rule_eval.get("confidence", 0.0), "source": "vision",
                "status": "open" if verdict == "violation" or rule_eval.get("status") == "violation" else "resolved",
                "evidence": [{"evidence_id": f"EVID-{str(uuid.uuid4())[:8]}", "type": "image", "file_path": file_path, "detections": detections, "timestamp": datetime.now().isoformat()}],
                "ai_decision": {"final_verdict": verdict, "justification": (debate or {}).get("justification", ""), "transcript": (debate or {}).get("transcript", [])},
                "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat(),
            }
            created_violations.append(record)
            violation_ids.append(violation_id)
            if db:
                db.collection("violations").document(violation_id).set(record)

        scorecard = build_inspection_scorecard(establishment_id, created_violations)
        report = f"Complaint ID: {complaint_id or 'unlinked'}\nEstablishment: {created_violations[0]['establishment_name']}\nYOLO detections: {len(detections)}\nVerdict: {(debate or {}).get('final_verdict', 'review')}\nScore: {scorecard['overall_score']} | Grade: {scorecard['grade']}\nViolation IDs: {', '.join(violation_ids)}"
        persist_complaint_artifacts(complaint_context, scorecard, report, datetime.now().isoformat(), debate=debate)
        if os.path.exists(file_path):
            os.remove(file_path)
        yield encode({"type": "complete", "violation_ids": violation_ids, "violations": created_violations, "scorecard": scorecard, "report": report, "report_id": complaint_context.get("report_id") if complaint_context else None, "scorecard_id": complaint_context.get("scorecard_id") if complaint_context else None, "complaint_id": complaint_id})

    return StreamingResponse(generate(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

@router.get("/debate-log/{violation_id}")
async def get_debate_log(violation_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
        
    doc = db.collection("debate_logs").document(violation_id).get()
    if doc.exists:
        return doc.to_dict()
    
    raise HTTPException(status_code=404, detail="Debate log not found")

@router.get("/reports")
async def get_reports(complaint_id: Optional[str] = None, establishment_id: Optional[str] = None):
    db = get_db()
    reports = []
    if db:
        try:
            ref = db.collection("reports")
            if complaint_id:
                ref = ref.where("complaint_id", "==", complaint_id)
            if establishment_id:
                ref = ref.where("establishment_id", "==", establishment_id)
            reports = [doc.to_dict() for doc in ref.stream()]
        except Exception as e:
            print("Error fetching reports from Firestore:", e)
    
    if not reports:
        reports = list(reports_store.values())
        if complaint_id:
            reports = [r for r in reports if r.get("complaint_id") == complaint_id]
        if establishment_id:
            reports = [r for r in reports if r.get("establishment_id") == establishment_id]
            
    return reports

@router.get("/rankings")
async def get_rankings():
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
        
    kitchens = []
    # Fallback to old kitchens collection or use establishments
    docs = db.collection("establishments").stream()
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
    try:
        payload = req.model_dump()
    except AttributeError:
        payload = req.dict()
        
    result = verify_product(payload)
    return result
