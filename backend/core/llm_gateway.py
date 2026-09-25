import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_keys(prefix: str, default: str = None) -> list:
    keys = []
    main_key = os.getenv(f"{prefix}_API_KEY", default)
    if main_key:
        keys.append(main_key)
    i = 1
    while True:
        k = os.getenv(f"{prefix}_API_KEY_{i}")
        if not k:
            break
        if k not in keys:
            keys.append(k)
        i += 1
    return keys

GROQ_KEYS = get_keys("GROQ")
GEMINI_KEYS = get_keys("GEMINI")
REQUESTY_KEYS = get_keys("REQUESTY")
REQUESTY_API_URL = os.getenv("REQUESTY_API_URL", "https://router.requesty.ai/v1/chat/completions")
REQUESTY_MODELS = [os.getenv("REQUESTY_MODEL", "requesty/auto")]

# Current stable model list as of Sep 2026. Avoid older 1.5 flags that can fail intermittently.
GROQ_MODELS = [
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
]

GEMINI_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-2.5-flash",
]

def call_groq(prompt: str) -> str:
    if not GROQ_KEYS:
        raise RuntimeError("GROQ_API_KEY not found.")
    url = "https://api.groq.com/openai/v1/chat/completions"
    last_error = ""
    for api_key in GROQ_KEYS:
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        for model in GROQ_MODELS:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 500 if "STRICTLY in JSON" in prompt else 220,
                "temperature": 0.4,
            }
            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=15)
                if resp.status_code == 200:
                    text = resp.json()["choices"][0]["message"].get("content", "")
                    if not text.strip():
                        last_error = "Groq returned an empty response"
                        continue
                    print(f"[OK] Groq {model} succeeded")
                    return text
                last_error = f"{resp.status_code}: {resp.text[:150]}"
                print(f"Groq {model} failed: {last_error}")
            except Exception as e:
                last_error = str(e)
    raise RuntimeError(f"Groq exhausted: {last_error}")

def call_gemini(prompt: str) -> str:
    if not GEMINI_KEYS:
        raise RuntimeError("GEMINI_API_KEY not found.")
    last_error = ""
    for api_key in GEMINI_KEYS:
        for model in GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"maxOutputTokens": 220, "temperature": 0.4},
            }
            try:
                resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=60)
                if resp.status_code == 200:
                    result = resp.json()
                    text = result["candidates"][0]["content"]["parts"][0]["text"]
                    print(f"[OK] Gemini {model} succeeded")
                    return text
                last_error = f"{resp.status_code}: {resp.text[:150]}"
                print(f"Gemini {model} failed: {last_error}")
            except Exception as e:
                last_error = str(e)
    raise RuntimeError(f"Gemini exhausted: {last_error}")

def call_requesty(prompt: str) -> str:
    if not REQUESTY_KEYS:
        raise RuntimeError("REQUESTY_API_KEY not found.")
    last_error = ""
    for api_key in REQUESTY_KEYS:
        for model in REQUESTY_MODELS:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 500 if "STRICTLY in JSON" in prompt else 220,
                "temperature": 0.4,
            }
            try:
                resp = requests.post(
                    REQUESTY_API_URL,
                    json=payload,
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    timeout=30,
                )
                if resp.status_code == 200:
                    text = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "")
                    if text.strip():
                        print(f"[OK] Requesty {model} succeeded")
                        return text
                    last_error = "Requesty returned an empty response"
                else:
                    last_error = f"{resp.status_code}: {resp.text[:150]}"
            except Exception as exc:
                last_error = str(exc)
    raise RuntimeError(f"Requesty exhausted: {last_error}")

PROVIDER_FUNCS = {"groq": call_groq, "gemini": call_gemini, "requesty": call_requesty}

def call_llm(prompt: str, provider: str = "groq", role: str = "user") -> str:
    selected_provider = provider.lower()
    if selected_provider not in PROVIDER_FUNCS:
        raise RuntimeError(f"Unsupported LLM provider: {provider}")
    provider_order = [selected_provider] + [name for name in ("gemini", "groq", "requesty") if name != selected_provider]
    failures = []
    for current_provider in provider_order:
        try:
            print(f"[LLM] Using {current_provider} for role={role}")
            return PROVIDER_FUNCS[current_provider](prompt)
        except RuntimeError as exc:
            failures.append(f"{current_provider}: {exc}")
            print(f"[LLM FAILOVER] {current_provider} failed: {exc}")
    raise RuntimeError("All LLM providers failed: " + " | ".join(failures))
