import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin
def init_firebase():
    if not firebase_admin._apps:
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback for local dev without a service account (might have limited access)
            # You can use application default credentials if gcloud is configured
            try:
                firebase_admin.initialize_app()
            except Exception as e:
                print(f"Warning: Could not initialize Firebase Admin with default credentials: {e}")
                print("Please provide FIREBASE_SERVICE_ACCOUNT_PATH in .env")

init_firebase()
db = None
if firebase_admin._apps:
    try:
        db = firestore.client()
    except Exception as e:
        print(f"Warning: Could not initialize Firestore client: {e}")
        print("Please provide FIREBASE_SERVICE_ACCOUNT_PATH in .env to use the database.")

def get_db():
    return db
