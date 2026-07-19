import os
from groq import Groq
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '..', '..', 'chatbot_service', '.env')
load_dotenv(env_path)

def generate_explanation(flags: list, details: dict, payload: dict) -> str:
    if not flags:
        return "Conclusion: The product passed all checks and is safe for use."
        
    client = Groq()
    
    prompt = f"""
    You are an expert food safety inspector and auditor. A product was just scanned and flagged for the following issues: {', '.join(flags)}.
    
    Here is the product info: {payload}
    Here are the detailed checks: {details}
    
    Please provide a concise, professional explanation formatted clearly with:
    - **Why:** Why the product was flagged.
    - **How:** How this violates safety protocols or what the specific danger is.
    - **Conclusion:** A final recommendation on what action the inspector should take.
    
    Keep it brief (max 3 short paragraphs). Use a professional, authoritative tone.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a professional food safety compliance auditor."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return "Explanation could not be generated at this time due to an AI service error."
