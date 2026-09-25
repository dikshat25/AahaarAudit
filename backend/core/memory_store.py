from typing import Dict, Any, List

# In-memory stores fallback for live demo responsiveness when Firestore is not connected or as local cache
violations_store: Dict[str, Any] = {}
reports_store: Dict[str, Any] = {}
scorecards_store: Dict[str, Any] = {}
debate_logs_store: Dict[str, Any] = {}
