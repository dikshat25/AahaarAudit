import os
from ultralytics import YOLO

def train_model():
    """
    Fine-tunes the base yolov8n.pt model on the cloned PPE dataset.
    """
    # Get the directory where train_ppe.py is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up to the 'backend' directory, then to datasets/ppe_dataset/data.yaml
    backend_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
    dataset_yaml = os.path.join(backend_dir, "datasets", "food_ppe_dataset", "data.yaml")
    if not os.path.exists(dataset_yaml):
        print(f"Error: {dataset_yaml} not found.")
        print("Please ensure the dataset is cloned and the path is correct.")
        return

    print("Loading base YOLOv8n model...")
    # Load a pretrained model (recommended for training)
    model = YOLO('yolov8n.pt')

    print("Starting training on PPE dataset...")
    # Train the model
    # We use a small number of epochs for prototype purposes. Increase for better results.
    results = model.train(
        data=dataset_yaml,
        epochs=3,
        freeze=10,
        imgsz=640,
        batch=16,
        project='runs/detect',
        name='ppe_finetuned'
    )
    print("Training complete! Model saved to runs/detect/ppe_finetuned/weights/best.pt")

if __name__ == "__main__":
    train_model()
