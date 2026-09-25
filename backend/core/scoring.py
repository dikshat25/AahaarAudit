from datetime import datetime, timedelta
import os

# Configurable window
VIOLATION_HISTORY_WINDOW_DAYS = int(os.getenv("VIOLATION_HISTORY_WINDOW_DAYS", "90"))

def calculate_scorecard(establishment_id: str, violations: list) -> dict:
    base_score = 100.0
    active_violations = 0
    recent_violations = 0
    recurring_violations = 0
    
    categories = {
        "PPE": 100.0,
        "HYGIENE": 100.0,
        "STORAGE": 100.0,
        "PRODUCT": 100.0,
        "GENERAL": 100.0
    }
    
    now = datetime.now()
    cutoff_date = now - timedelta(days=VIOLATION_HISTORY_WINDOW_DAYS)
    
    violation_counts = {}
    score_history_months = {} # For trend
    
    for v in violations:
        try:
            detected_at = datetime.fromisoformat(v.get("detected_at", now.isoformat()))
        except ValueError:
            detected_at = now
            
        month_key = detected_at.strftime("%Y-%m")
        score_history_months.setdefault(month_key, 100.0)
            
        is_active = detected_at >= cutoff_date
        
        if is_active:
            recent_violations += 1
            if v.get("status") != "resolved":
                active_violations += 1
                
            v_type = v.get("violation_type", "general")
            violation_counts[v_type] = violation_counts.get(v_type, 0) + 1
            if violation_counts[v_type] > 1:
                recurring_violations += 1
                
            severity = v.get("severity", "medium").lower()
            penalty = 0.0
            if severity == "critical":
                penalty = 15.0
            elif severity == "high":
                penalty = 10.0
            elif severity == "medium":
                penalty = 5.0
            else:
                penalty = 2.0
                
            if violation_counts[v_type] > 1:
                penalty += 5.0 # Repeat penalty
                
            if v.get("status") == "resolved":
                penalty *= 0.2 # Reduced impact if resolved
                
            base_score -= penalty
            cat = v.get("category", "GENERAL").upper()
            if cat in categories:
                categories[cat] -= penalty
                
            score_history_months[month_key] -= penalty
                
    base_score = max(0.0, base_score)
    for k in categories:
        categories[k] = max(0.0, categories[k])
        
    sorted_months = sorted(score_history_months.keys())
    trend = "stable"
    if len(sorted_months) >= 2:
        oldest = score_history_months[sorted_months[0]]
        newest = score_history_months[sorted_months[-1]]
        if newest > oldest + 5:
            trend = "improving"
        elif newest < oldest - 5:
            trend = "deteriorating"

    return {
        "establishment_id": establishment_id,
        "overall_score": round(base_score, 1),
        "categories": {k: round(v, 1) for k, v in categories.items()},
        "active_violations": active_violations,
        "recent_violations": recent_violations,
        "recurring_violations": recurring_violations,
        "trend": trend
    }
