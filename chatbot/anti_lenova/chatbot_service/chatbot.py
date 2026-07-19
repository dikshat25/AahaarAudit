import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def load_app_info():
    kb_path = os.path.join(os.path.dirname(__file__), 'knowledge_base', 'app_info.md')
    try:
        with open(kb_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return ""

def answer_question(user_question: str) -> str:
    app_info_content = load_app_info()
    
    system_prompt = f"You are a help assistant for the Aahaar-Audit app. Answer questions using only the following app information. If the question is unrelated to the app, politely say you can only help with questions about Aahaar-Audit. App info: {app_info_content}"
    
    try:
        client = Groq()
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_question}
            ],
            model="llama-3.1-8b-instant",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"Error connecting to chatbot service: {e}"
