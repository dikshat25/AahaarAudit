from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class Location(BaseModel):
    latitude: float
    longitude: float

class Establishment(BaseModel):
    establishment_id: str
    name: str
    type: str = "restaurant"
    location: Optional[Location] = None
    risk_score: float = 0.0
    created_at: str
    updated_at: str

class Evidence(BaseModel):
    evidence_id: str
    type: str  # image, video_frame, text
    url: Optional[str] = None
    file_path: Optional[str] = None
    detections: Optional[List[Any]] = []
    timestamp: str

class ExpertOpinion(BaseModel):
    expert_type: str
    opinion: str
    severity: str
    recommendation: str
    confidence: float
    timestamp: str

class Violation(BaseModel):
    violation_id: str
    establishment_id: str
    establishment_name: str = ""
    detected_at: str
    violation_type: str
    category: str
    severity: str
    confidence: float
    source: str
    status: str = "open"  # open, resolved, archived
    evidence: List[Evidence] = []
    ai_decision: Dict[str, Any] = {}
    human_review: Dict[str, Any] = {}
    expert_opinions: List[ExpertOpinion] = []
    created_at: str
    updated_at: str

class Alert(BaseModel):
    alert_id: str
    violation_id: str
    establishment_id: str
    severity: str
    message: str
    location: Optional[Location] = None
    status: str = "unread"
    timestamp: str

class Scorecard(BaseModel):
    establishment_id: str
    overall_score: float
    categories: Dict[str, float]
    active_violations: int
    recent_violations: int
    recurring_violations: int
    trend: str
