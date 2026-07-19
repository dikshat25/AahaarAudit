from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ViolationModel(BaseModel):
    id: str
    class_name: str
    confidence: float
    bbox: List[float]

class EventModel(BaseModel):
    id: str
    kitchen_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str # 'clear', 'violation', 'ambiguous'
    confidence: float
    matched_rules: List[str] = []
    violations: List[ViolationModel] = []
    image_url: Optional[str] = None
    debate_id: Optional[str] = None

class DebateLogModel(BaseModel):
    id: str
    event_id: str
    transcript: List[Dict[str, str]] = [] # list of {role: 'gemini', content: '...'}
    agreement_score: float
    rounds: int
    final_verdict: str
    final_confidence: float
    justification: str

class KitchenModel(BaseModel):
    id: str
    name: str
    location: str
    risk_score: float = 0.0

class InspectionRankModel(BaseModel):
    kitchen_id: str
    rank: int
    score: float
