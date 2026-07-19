import os
import math
from typing import List, Dict, Any, Tuple
from ultralytics import YOLO
import pillow_avif

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config.settings import PPE_MODEL_PATH

class VisionAgent:
    def __init__(self, model_path: str = None):
        """
        Initializes the Vision Agent with two YOLOv8 models:
        1. base_model for detecting persons and standard objects
        2. ppe_model for detecting fine-tuned PPE classes
        """
        self.base_model = YOLO('yolo11n.pt')
        
        if model_path is None:
            model_path = PPE_MODEL_PATH
            
        if not os.path.exists(model_path):
            print(f"Warning: {model_path} not found. PPE detections will not be available.")
            self.ppe_model = None
        else:
            self.ppe_model = YOLO(model_path)

    def detect_frame(self, image_path: str) -> List[Dict[str, Any]]:
        """
        Runs object detection on a single frame using both models.
        Returns a merged list of dictionaries with class_name, confidence, and bbox.
        """
        from PIL import Image
        
        try:
            # Load the image with PIL to support avif, webp, and other formats natively
            with Image.open(image_path) as src_img:
                src_img.load()
                img = src_img.convert("RGB")
        except Exception as e:
            print(f"Error loading image {image_path}: {e}")
            return []
            
        detections = []
        
        # 1. Base model pass
        base_results = self.base_model(img)
        for result in base_results:
            for box in result.boxes:
                bbox = box.xywh[0].tolist() 
                conf = box.conf[0].item()
                cls_id = int(box.cls[0].item())
                cls_name = self.base_model.names[cls_id]
                detections.append({
                    "class": cls_name,
                    "confidence": conf,
                    "bbox": bbox,
                    "class_id": cls_id
                })
                
        # 2. PPE model pass
        if self.ppe_model:
            ppe_results = self.ppe_model(img)
            for result in ppe_results:
                for box in result.boxes:
                    bbox = box.xywh[0].tolist() 
                    conf = box.conf[0].item()
                    cls_id = int(box.cls[0].item())
                    cls_name = self.ppe_model.names[cls_id]
                    detections.append({
                        "class": cls_name,
                        "confidence": conf,
                        "bbox": bbox,
                        "class_id": cls_id
                    })
                
        return detections

    def check_proximity(self, detections: List[Dict[str, Any]], class_a: str, class_b: str, threshold_px: float) -> List[Tuple[Dict, Dict, float]]:
        """
        Checks if any instance of class_a is within threshold_px of any instance of class_b.
        Returns a list of violating pairs and their distance.
        """
        instances_a = [d for d in detections if d["class"].lower() == class_a.lower()]
        instances_b = [d for d in detections if d["class"].lower() == class_b.lower()]
        
        violations = []
        for a in instances_a:
            for b in instances_b:
                # bbox format is [x_center, y_center, width, height]
                xa, ya = a["bbox"][0], a["bbox"][1]
                xb, yb = b["bbox"][0], b["bbox"][1]
                
                # Euclidean distance between centers
                distance = math.sqrt((xa - xb)**2 + (ya - yb)**2)
                if distance <= threshold_px:
                    violations.append((a, b, distance))
                    
        return violations
