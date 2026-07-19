from chatbot import answer_question

def run_tests():
    questions = [
        "what does this app do",
        "how do I upload footage",
        "what is a risk score",
        "what's the weather today"
    ]
    
    for q in questions:
        print(f"Q: {q}")
        print(f"A: {answer_question(q)}\n")

if __name__ == "__main__":
    run_tests()
