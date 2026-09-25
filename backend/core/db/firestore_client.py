import os
import json
import tempfile
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Search and load backend/.env reliably
BASE_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
env_path = os.path.join(BASE_BACKEND_DIR, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

def find_service_account():
    """Try to resolve Firebase credentials from env JSON string or file path."""
    # Priority 1: JSON content provided directly as env var (for Render / cloud deploy)
    sa_json_str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if sa_json_str:
        try:
            sa_dict = json.loads(sa_json_str)
            # Write to a temp file because firebase_admin expects a file or dict
            tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False)
            json.dump(sa_dict, tmp)
            tmp.close()
            return tmp.name
        except Exception as e:
            print(f"Warning: Could not parse FIREBASE_SERVICE_ACCOUNT_JSON: {e}")

    # Priority 2: File path candidates
    candidates = [
        os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"),
        os.path.join(BASE_BACKEND_DIR, "firebase", "aahaaraudit-firebase-adminsd.json"),
        os.path.join(BASE_BACKEND_DIR, "aahaaraudit-firebase-adminsd.json"),
        os.path.join(os.getcwd(), "backend", "firebase", "aahaaraudit-firebase-adminsd.json"),
        os.path.join(os.getcwd(), "firebase", "aahaaraudit-firebase-adminsd.json"),
        os.path.join(os.getcwd(), "aahaaraudit-firebase-adminsd.json"),
        os.path.join(os.getcwd(), "..", "aahaaraudit-firebase-adminsd.json"),
    ]
    for path in candidates:
        if path and os.path.exists(path):
            return os.path.abspath(path)
    return None

# Initialize Firebase Admin
def init_firebase():
    if not firebase_admin._apps:
        sa_path = find_service_account()
        if sa_path:
            try:
                cred = credentials.Certificate(sa_path)
                firebase_admin.initialize_app(cred)
                print(f"[OK] Firebase Admin initialized using service account: {sa_path}")
            except Exception as e:
                print(f"Error loading service account from {sa_path}: {e}")
        else:
            try:
                firebase_admin.initialize_app()
                print("Firebase Admin initialized with default credentials.")
            except Exception as e:
                print(f"Warning: Could not initialize Firebase Admin: {e}")

init_firebase()
db = None
if firebase_admin._apps:
    try:
        db = firestore.client()
        print("[OK] Firestore client successfully connected!")
    except Exception as e:
        print(f"Warning: Could not initialize Firestore client: {e}")

def get_db():
    return db
