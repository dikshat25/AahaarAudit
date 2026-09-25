import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'backend')))
from core.llm_gateway import call_llm

def load_app_info():
    kb_path = os.path.join(os.path.dirname(__file__), 'knowledge_base', 'app_info.md')
    try:
        with open(kb_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return ""

def answer_question(user_question: str) -> str:
    app_info_content = load_app_info()
    
    prompt = f"System: You are a help assistant for the Aahaar-Audit app. Answer questions using only the following app information. If the question is unrelated to the app, politely say you can only help with questions about Aahaar-Audit. App info: {app_info_content}\n\nUser: {user_question}"
    
    try:
        # Defaults to failover starting with groq
        return call_llm(prompt, provider="groq")
    except Exception as e:
        return f"Error connecting to chatbot service: {e}"
