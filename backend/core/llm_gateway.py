import os
from dotenv import load_dotenv

load_dotenv()

# We will use simple HTTP requests for Groq and Gemini if SDKs are tricky,
# but let's try using the official SDKs first.
try:
    from groq import Groq
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
except ImportError:
    groq_client = None

try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    gemini_client = True # Just a flag to indicate it's available
except ImportError:
    gemini_client = None


def call_llm(prompt: str, provider: str, role: str = "user") -> str:
    """
    Call the specified LLM provider with the given prompt.
    Supported providers: 'gemini', 'groq'
    """
    if provider.lower() == 'gemini':
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not found in environment.")
        
        try:
            import requests
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            headers = {"Content-Type": "application/json"}
            
            resp = requests.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
            else:
                return f"Error: API returned {resp.status_code} - {resp.text}"
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return f"Error: {e}"

    elif provider.lower() == 'groq':
        if not groq_client:
            raise RuntimeError("Groq SDK not properly initialized. Check requirements and API key.")
        
        try:
            # Using a fast, low-rate-limit model on Groq
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.1-8b-instant",
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Error calling Groq: {e}")
            return f"Error: {e}"
    else:
        raise ValueError(f"Unsupported provider: {provider}")
