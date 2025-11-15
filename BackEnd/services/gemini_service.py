import google.generativeai as genai
from config import GEMINI_API_KEY, CBT_PROMPTS

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.5-flash")
else:
    gemini_model = None


def get_cbt_guidance(emotion: str, user_note: str = "") -> str:
    """Generate CBT-based guidance using Gemini"""
    if not gemini_model:
        return "Gemini API not configured. Please set GEMINI_API_KEY in .env"

    emotion_lower = emotion.lower()

    if emotion_lower in CBT_PROMPTS:
        prompt = CBT_PROMPTS[emotion_lower].format(user_note=user_note)
    else:
        prompt = (
            f"The user is experiencing {emotion}. As a compassionate CBT therapist, "
            f"provide empathetic support and suggest evidence-based coping strategies. "
            f"User note: '{user_note}'."
        )

    full_prompt = (
        "You are a compassionate CBT therapist. Your goal is to help the user using evidence-based CBT techniques. "
        f"{prompt}\n"
        "1. Validate the user's feelings.\n"
        "2. Identify and challenge negative thoughts.\n"
        "3. Suggest practical CBT coping strategies.\n"
        "4. Encourage small, achievable actions.\n"
        "5. End with a supportive, hopeful message.\n"
        "Keep response concise (3-4 paragraphs)."
    )

    try:
        response = gemini_model.generate_content(full_prompt)
        return response.text.strip() if response and response.text else "Unable to generate response"
    except Exception as e:  # pragma: no cover - external API call
        return f"Error generating guidance: {str(e)}"


def get_chatbot_response(user_message: str, conversation_history: list = None) -> tuple[str, str]:
    """Generate chatbot response using Gemini"""
    if not gemini_model:
        return "Error", "Gemini API not configured"

    conversation_history = conversation_history or []

    system_prompt = (
        "You are a compassionate mental health support assistant named CLARITY. "
        "Your role is to listen empathetically, validate emotions, and provide supportive guidance. "
        "Use CBT principles in your responses. Keep responses concise and supportive."
    )

    conversation_context = ""
    for msg in conversation_history[-5:]:
        conversation_context += f"User: {msg.get('user', '')}\nAssistant: {msg.get('assistant', '')}\n"

    full_prompt = (
        f"{system_prompt}\n\n"
        f"Previous conversation:\n{conversation_context}\n\n"
        f"User: {user_message}\n\nAssistant:"
    )

    try:
        response = gemini_model.generate_content(full_prompt)
        assistant_message = response.text.strip() if response and response.text else "I'm here to listen"

        detected_emotion = detect_emotion_from_text(user_message)

        return assistant_message, detected_emotion
    except Exception as e:  # pragma: no cover - external API call
        return f"Error: {str(e)}", None


def detect_emotion_from_text(text: str) -> str:
    """Simple emotion detection from text using keyword matching"""
    text_lower = text.lower()

    emotion_keywords = {
        "angry": ["angry", "furious", "rage", "mad", "upset", "irritated"],
        "sad": ["sad", "depressed", "unhappy", "miserable", "down", "disappointed"],
        "happy": ["happy", "joy", "excited", "great", "wonderful", "fantastic"],
        "anxious": ["anxious", "worried", "nervous", "stressed", "fearful", "panic"],
        "neutral": ["okay", "fine", "alright", "normal", "stable"],
        "calm": ["calm", "peaceful", "relaxed", "serene", "tranquil", "composed"],
    }

    for emotion, keywords in emotion_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            return emotion

    return None
