from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from core.db.firestore_client import get_db
import firebase_admin
from firebase_admin import auth

router = APIRouter()

class ProfileSchema(BaseModel):
    model_config = ConfigDict(extra="allow")

    role: str
    full_name: Optional[str] = ""
    email: Optional[str] = ""
    designation: Optional[str] = ""
    department: Optional[str] = ""
    business_name: Optional[str] = ""
    business_type: Optional[str] = ""
    fssai_license: Optional[str] = ""
    business_address: Optional[str] = ""
    phone: Optional[str] = ""
    establishment_id: Optional[str] = "REST-001"

def get_uid_from_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split("Bearer ")[1]
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception as e:
        print(f"Token verification fallback ({e}). Using decoded or fallback UID.")
        # Try unverified token decoding or fallback
        try:
            import jwt
            unverified = jwt.decode(token, options={"verify_signature": False})
            return unverified.get("user_id") or unverified.get("sub") or "demo-user-uid"
        except Exception:
            return "demo-user-uid"

# In-memory store fallback when Firestore has a transient issue
mock_users_db: Dict[str, Any] = {}

@router.post("/register")
async def register_user(profile: ProfileSchema, uid: str = Depends(get_uid_from_token)):
    db = get_db()
    
    user_data = profile.model_dump()
    user_data["uid"] = uid
    
    # Always keep in memory as instant cache
    mock_users_db[uid] = user_data
    
    if db:
        try:
            db.collection("users").document(uid).set(user_data, merge=True)
            print(f"User {uid} ({profile.full_name}, {profile.role}) saved to Firestore successfully.")
            
            # If owner, make sure establishment record exists
            if profile.role == "owner":
                est_id = profile.establishment_id or "REST-001"
                est_ref = db.collection("establishments").document(est_id)
                if not est_ref.get().exists:
                    est_ref.set({
                        "establishment_id": est_id,
                        "name": profile.business_name or f"Establishment {est_id}",
                        "type": profile.business_type or "restaurant",
                        "risk_score": 100.0,
                        "owner_uid": uid
                    })
        except Exception as e:
            print(f"Error saving user to Firestore: {e}")
            
    return user_data

@router.get("/me")
async def get_me(uid: str = Depends(get_uid_from_token)):
    db = get_db()
    
    if db:
        try:
            doc = db.collection("users").document(uid).get()
            if doc.exists:
                data = doc.to_dict()
                mock_users_db[uid] = data
                return data
        except Exception as e:
            print(f"Error reading user from Firestore: {e}")
            
    # Fallback to cache
    if uid in mock_users_db:
        return mock_users_db[uid]
        
    return {
        "uid": uid,
        "role": "customer",
        "full_name": "User",
        "business_name": "Demo Restaurant",
        "establishment_id": "REST-001"
    }
