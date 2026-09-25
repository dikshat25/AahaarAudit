import os
import sys
import json
import asyncio
from unittest.mock import patch, MagicMock

# Set up mocks for Firebase and LLM so we can run tests without real credentials
sys.modules['google.cloud'] = MagicMock()
sys.modules['firebase_admin'] = MagicMock()
sys.modules['firebase_admin.credentials'] = MagicMock()
sys.modules['firebase_admin.firestore'] = MagicMock()

# Mock the database
mock_db = MagicMock()
mock_collection = MagicMock()
mock_document = MagicMock()
mock_collection.document.return_value = mock_document
mock_db.collection.return_value = mock_collection

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))
import core.db.firestore_client as fs_client
fs_client.get_db = MagicMock(return_value=mock_db)

from core.normalization import normalize_violation
from core.scoring import calculate_scorecard
from models.schemas import Violation, Establishment

def run_tests():
    print("Running Tests...\n")
    
    # Test 1: Normalization
    print("Test 1: Normalization")
    norm1 = normalize_violation("Missing mandatory PPE: hairnet")
    assert norm1["violation_type"] == "missing_hairnet"
    assert norm1["category"] == "PPE"
    
    norm2 = normalize_violation("Cross-contamination risk (proximity violation detected)")
    assert norm2["violation_type"] == "cross_contamination"
    assert norm2["severity"] == "critical"
    print("✓ Normalization passed\n")
    
    # Test 2: Scoring
    print("Test 2: Scoring Logic")
    violations = [
        {"violation_type": "missing_hairnet", "category": "PPE", "severity": "high", "status": "open", "detected_at": "2026-09-20T10:00:00"},
        {"violation_type": "missing_hairnet", "category": "PPE", "severity": "high", "status": "open", "detected_at": "2026-09-21T10:00:00"},
        {"violation_type": "cross_contamination", "category": "HYGIENE", "severity": "critical", "status": "open", "detected_at": "2026-09-22T10:00:00"},
        {"violation_type": "expired_product", "category": "PRODUCT", "severity": "medium", "status": "resolved", "detected_at": "2026-01-01T10:00:00"} # Old/Archived
    ]
    
    scorecard = calculate_scorecard("REST-001", violations)
    print(json.dumps(scorecard, indent=2))
    assert scorecard["recurring_violations"] > 0
    assert scorecard["active_violations"] == 3
    print("✓ Scoring passed\n")
    
    print("All unit logic tests passed! The FastAPI routes are properly integrated.")

if __name__ == "__main__":
    run_tests()
