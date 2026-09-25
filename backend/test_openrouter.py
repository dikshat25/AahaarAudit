import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

def test_openrouter():
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [{"role": "user", "content": "hello"}]
    }
    resp = requests.post(url, json=payload, headers=headers)
    print(resp.status_code)
    print(resp.text)

if __name__ == "__main__":
    test_openrouter()
