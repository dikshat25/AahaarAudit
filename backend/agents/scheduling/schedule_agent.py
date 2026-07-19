from typing import List, Dict, Any

def rank_kitchens(kitchens: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ranks kitchens based on their risk score in descending order.
    Expected input format: [{"kitchen_id": "k1", "score": 10.5}, ...]
    """
    return sorted(kitchens, key=lambda x: x.get('score', 0.0), reverse=True)
