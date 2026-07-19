import cv2
import requests
import os
import time

def extract_and_test(video_path, endpoint_url="http://localhost:8000/api/v1/ingest-frame", kitchen_id="kitchen_001"):
    if not os.path.exists(video_path):
        print(f"Error: Could not find video at {video_path}")
        return

    print(f"Extracting frame from {video_path}...")
    # Open the video
    cap = cv2.VideoCapture(video_path)
    
    # Read the first frame
    ret, frame = cap.read()
    if not ret:
        print("Error: Could not read frame from video.")
        cap.release()
        return
        
    # Save frame temporarily
    temp_frame_path = "temp_test_frame.jpg"
    cv2.imwrite(temp_frame_path, frame)
    cap.release()
    print(f"Successfully extracted frame to {temp_frame_path}")

    # Send frame to API
    print(f"Sending frame to {endpoint_url} for analysis...")
    
    with open(temp_frame_path, 'rb') as f:
        files = {'file': ('frame.jpg', f, 'image/jpeg')}
        data = {'kitchen_id': kitchen_id}
        
        try:
            start_time = time.time()
            response = requests.post(endpoint_url, files=files, data=data)
            duration = time.time() - start_time
            
            print(f"Response received in {duration:.2f} seconds.")
            print("\n--- Pipeline Result ---")
            
            if response.status_code == 200:
                result = response.json()
                event = result.get("event", {})
                print(f"Status: {event.get('status')}")
                print(f"Confidence: {event.get('confidence')}")
                print(f"Matched Rules: {event.get('matched_rules')}")
                print(f"Justification: {event.get('justification')}")
                print(f"Risk Score: {event.get('risk_score')}")
                
                detections = event.get('detections', [])
                print(f"\nRaw YOLO Detections found: {len(detections)}")
                for d in detections:
                    print(f"  - {d['class']} ({d['confidence']:.2f})")
                    
                if event.get('debate_id'):
                    print(f"\n[!] A debate was triggered (ID: {event['debate_id']})")
                    if 'transcript' in event:
                        print("\n--- Full Debate Transcript ---")
                        for line in event['transcript']:
                            output = f"\n[{line['role'].upper()}]:\n{line['content']}\n"
                            print(output.strip())
                        print("\n[SUCCESS] The full transcript was retrieved successfully!")
                    else:
                        print(f"You can view the full transcript at: /api/v1/debate-log/{event['debate_id']}")
                        

                    
            else:
                print(f"Error {response.status_code}: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print(f"\nError: Could not connect to {endpoint_url}.")
            print("Make sure the FastAPI server is running in another terminal using:")
            print("  cd backend")
            print("  uvicorn main:app --reload")
            
    # Cleanup
    if os.path.exists(temp_frame_path):
        os.remove(temp_frame_path)

if __name__ == "__main__":
    video_file = os.path.join("temp_uploads", "image1.jpg")
    extract_and_test(video_file)
