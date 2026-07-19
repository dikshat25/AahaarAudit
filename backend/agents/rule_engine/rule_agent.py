from typing import List, Dict, Any, Tuple

class RuleEngine:
    def __init__(self):
        # Mandatory PPE classes expected for a compliant person
        # We will handle the exact class names (glove, hairnet, hat, mask) in evaluate_detections
        self.ambiguity_threshold = 0.50 # Confidences between 0.30 and 0.50 are ambiguous
        self.min_confidence = 0.30

    def evaluate_detections(self, detections: List[Dict[str, Any]], proximity_violations: List[Tuple] = None) -> Dict[str, Any]:
        """
        Evaluates frame detections against hardcoded FSSAI rules.
        Returns {status: "clear" | "violation" | "ambiguous", confidence: float, matched_rules: List[str]}
        """
        matched_rules = []
        status = "clear"
        overall_confidence = 1.0

        if proximity_violations and len(proximity_violations) > 0:
            status = "violation"
            matched_rules.append("Cross-contamination risk (proximity violation detected)")
            # Assuming proximity is a critical violation
            return {"status": status, "confidence": 0.95, "matched_rules": matched_rules}

        # Filter out low confidence noise
        valid_detections = [d for d in detections if d['confidence'] >= self.min_confidence]
        persons = [d for d in valid_detections if d['class'].lower() == "person"]

        if not persons:
            # If no person is in frame, we cannot evaluate PPE rules.
            return {"status": "no_subject", "confidence": 1.0, "matched_rules": ["No person detected in frame."]}

        ambiguous_cases = []
        for person in persons:
            # Check if person has mandatory PPE. 
            # In a real system, we'd check if the PPE bounding box is inside the person bounding box.
            # Here we simplify: if there's a person, there must be at least one of each mandatory PPE in the frame.
            person_conf = person['confidence']
            if person_conf < self.ambiguity_threshold:
                ambiguous_cases.append("Person detected with low confidence")
            
            # Check mask
            mask_items = [d for d in valid_detections if d['class'].lower() == 'mask']
            no_mask_items = [d for d in valid_detections if d['class'].lower() in ['no_mask', 'incorrect_mask']]
            if not mask_items or no_mask_items:
                matched_rules.append("Missing or incorrect mandatory PPE: mask")
                status = "violation"
                overall_confidence = min(overall_confidence, person_conf)
            else:
                if min([d['confidence'] for d in mask_items]) < self.ambiguity_threshold:
                    ambiguous_cases.append("Ambiguous mask detection (low confidence)")

            # Check glove
            glove_items = [d for d in valid_detections if d['class'].lower() == 'glove']
            no_glove_items = [d for d in valid_detections if d['class'].lower() == 'no_glove']
            if not glove_items or no_glove_items:
                matched_rules.append("Missing mandatory PPE: glove")
                status = "violation"
                overall_confidence = min(overall_confidence, person_conf)
            else:
                if min([d['confidence'] for d in glove_items]) < self.ambiguity_threshold:
                    ambiguous_cases.append("Ambiguous glove detection (low confidence)")

            # Check hairnet
            hat_items = [d for d in valid_detections if d['class'].lower() == 'hairnet']
            no_hairnet_items = [d for d in valid_detections if d['class'].lower() == 'no_hairnet']
            if not hat_items or no_hairnet_items:
                matched_rules.append("Missing mandatory PPE: hairnet")
                status = "violation"
                overall_confidence = min(overall_confidence, person_conf)
            else:
                if min([d['confidence'] for d in hat_items]) < self.ambiguity_threshold:
                    ambiguous_cases.append("Ambiguous hairnet detection (low confidence)")

        if status == "clear" and ambiguous_cases:
            status = "ambiguous"
            matched_rules.extend(ambiguous_cases)
            overall_confidence = 0.45 # arbitrary low confidence for ambiguity

        if status == "violation" and ambiguous_cases:
             status = "ambiguous"
             matched_rules.extend(ambiguous_cases)
             overall_confidence = 0.45

        return {
            "status": status,
            "confidence": round(overall_confidence, 2),
            "matched_rules": matched_rules
        }
