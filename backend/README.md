# Aahaar-Audit Backend

This is the FastAPI backend for the Aahaar-Audit food-safety compliance monitoring prototype.

## Setup

1. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your keys:
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_SERVICE_ACCOUNT_PATH`: To interact with Firestore, you must download a Service Account JSON key from your Firebase Console (Project Settings -> Service Accounts -> Generate new private key) and place it in the root of the backend folder, and provide the path here.

4. **Start Server**:
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

- `POST /api/v1/ingest-frame`: Ingest a frame for a given `kitchen_id`. Triggers the Vision Agent -> Rule Engine -> Debate (if ambiguous/severe).
- `GET /api/v1/debate-log/{violation_id}`: Retrieve the full transcript of a debate.
- `GET /api/v1/rankings`: Get a ranked list of kitchens based on their risk score.

## Datasets and Fine-tuning
The `datasets/ppe_dataset` directory contains the cloned YOLO-ready PPE dataset.
To fine-tune the base `yolov8n.pt` model, run:
```bash
python agents/vision_inspection/train_ppe.py
```
This will train the model and save the best weights in `runs/detect/ppe_finetuned/weights/best.pt`. You can then update `vision_agent.py` to point to this new model path if you wish to use it in the API.

## Demo Footage
Check the `demo_footage/README.md` for instructions on staging clips to test this pipeline.
