from verifier import check_expiry, check_supplier, check_completeness, verify_product
from datetime import datetime, timedelta

def run_tests():
    passed = 0
    total = 0
    
    today = datetime.now().date()
    
    print("--- Testing check_expiry ---")
    
    # Expired
    total += 1
    expired_date = (today - timedelta(days=2)).strftime("%Y-%m-%d")
    res = check_expiry(expired_date)
    print(f"Expired test: Expected 'expired', Actual '{res['status']}'")
    if res['status'] == 'expired': passed += 1
    
    # Expiring soon
    total += 1
    soon_date = (today + timedelta(days=3)).strftime("%Y-%m-%d")
    res = check_expiry(soon_date)
    print(f"Expiring soon test: Expected 'expiring_soon', Actual '{res['status']}'")
    if res['status'] == 'expiring_soon': passed += 1
    
    # Valid
    total += 1
    valid_date = (today + timedelta(days=30)).strftime("%Y-%m-%d")
    res = check_expiry(valid_date)
    print(f"Valid test: Expected 'valid', Actual '{res['status']}'")
    if res['status'] == 'valid': passed += 1
    
    print("\n--- Testing check_supplier ---")
    
    # Registered
    total += 1
    res = check_supplier("Fresh Farms")
    print(f"Registered test: Expected 'registered', Actual '{res['status']}'")
    if res['status'] == 'registered': passed += 1
    
    # Registered different casing
    total += 1
    res = check_supplier("fReSh faRms")
    print(f"Casing test: Expected 'registered', Actual '{res['status']}'")
    if res['status'] == 'registered': passed += 1
    
    # Unregistered
    total += 1
    res = check_supplier("Unknown Supplier")
    print(f"Unregistered test: Expected 'unregistered_supplier', Actual '{res['status']}'")
    if res['status'] == 'unregistered_supplier': passed += 1
    
    print("\n--- Testing check_completeness ---")
    
    valid_payload = {
        "kitchen_id": "K1", "barcode": "123", "product_name": "Apple", 
        "brand": "Farms", "manufacture_date": "2023-01-01", 
        "expiry_date": valid_date, "supplier_name": "Fresh Farms", 
        "batch_number": "B1", "scanned_at": "2023-10-01"
    }
    
    # Complete
    total += 1
    res = check_completeness(valid_payload)
    print(f"Complete test: Expected 'complete', Actual '{res['status']}'")
    if res['status'] == 'complete': passed += 1
    
    # Incomplete
    total += 1
    inc_payload = dict(valid_payload)
    inc_payload["kitchen_id"] = ""
    del inc_payload["barcode"]
    res = check_completeness(inc_payload)
    print(f"Incomplete test: Expected 'incomplete_data', Actual '{res['status']}'")
    if res['status'] == 'incomplete_data': passed += 1
    
    print("\n--- Testing verify_product ---")
    
    # Clear
    total += 1
    res = verify_product(valid_payload)
    print(f"Clear payload test: Expected 'clear', Actual '{res['status']}'")
    if res['status'] == 'clear': passed += 1
    
    # Expired flagged
    total += 1
    exp_payload = dict(valid_payload)
    exp_payload["expiry_date"] = expired_date
    res = verify_product(exp_payload)
    print(f"Expired payload test: Expected 'flagged' with 'expired', Actual '{res['status']}' with {res['flags']}")
    if res['status'] == 'flagged' and 'expired' in res['flags']: passed += 1
    
    # Missing field
    total += 1
    res = verify_product(inc_payload)
    print(f"Missing field payload test: Expected 'flagged' with 'incomplete_data', Actual '{res['status']}' with {res['flags']}")
    if res['status'] == 'flagged' and 'incomplete_data' in res['flags']: passed += 1
    
    print(f"\n{passed}/{total} tests passed")

if __name__ == "__main__":
    run_tests()
