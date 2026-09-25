import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

import firebase_admin
from firebase_admin import auth, firestore
from core.db.firestore_client import get_db

users_to_create = [
    {
        "email": "customer@gmail.com",
        "password": "password",
        "role": "customer",
        "full_name": "Demo Customer",
        "phone": "+91 98765 43210"
    },
    {
        "email": "hotel@gmail.com",
        "password": "password",
        "role": "owner",
        "full_name": "Hotel Grand Palace Owner",
        "business_name": "Hotel Grand Palace",
        "business_type": "Fine Dining & Banquet",
        "establishment_id": "REST-001",
        "fssai_license": "11521012000456",
        "business_address": "12 Marine Drive, Mumbai"
    },
    {
        "email": "admin@gmail.com",
        "password": "password",
        "role": "regulator",
        "full_name": "Admin Officer",
        "designation": "Senior Food Inspector",
        "department": "FSSAI Enforcement Division"
    }
]

db = get_db()
print("Firestore connection status:", db is not None)

for u in users_to_create:
    email = u["email"]
    password = u["password"]
    role = u["role"]
    full_name = u["full_name"]
    
    uid = None
    try:
        user_record = auth.get_user_by_email(email)
        uid = user_record.uid
        auth.update_user(uid, password=password, display_name=full_name)
        print(f"[OK] Updated existing user {email} (UID: {uid})")
    except Exception:
        try:
            user_record = auth.create_user(email=email, password=password, display_name=full_name)
            uid = user_record.uid
            print(f"[OK] Created new user {email} (UID: {uid})")
        except Exception as err:
            print(f"[ERROR] Failed to create {email}: {err}")
            
    if uid and db:
        user_data = dict(u)
        user_data.pop("password")
        user_data["uid"] = uid
        db.collection("users").document(uid).set(user_data, merge=True)
        print(f"[OK] Saved profile in Firestore for {email}")
        
        if role == "owner":
            est_id = u["establishment_id"]
            db.collection("establishments").document(est_id).set({
                "establishment_id": est_id,
                "name": u["business_name"],
                "owner_email": email,
                "owner_uid": uid,
                "owner_name": full_name,
                "type": u["business_type"],
                "risk_score": 92.0,
                "address": u["business_address"],
                "fssai_license": u["fssai_license"],
                "lat": 18.9220,
                "lng": 72.8347
            }, merge=True)
            print(f"[OK] Linked establishment {est_id} to owner {email}")

print("Seeding completed successfully!")
