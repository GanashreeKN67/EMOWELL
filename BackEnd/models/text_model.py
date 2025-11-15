from services.gemini_service import get_cbt_guidance, detect_emotion_from_text


def analyze_text_emotion(text: str, user_note: str = "") -> dict:
    """Analyze emotion from text and generate CBT guidance"""
    detected_emotion = detect_emotion_from_text(text)

    if not detected_emotion:
        detected_emotion = "neutral"

    guidance = get_cbt_guidance(detected_emotion, user_note or text[:200])

    coping_strategies = extract_coping_strategies(detected_emotion)

    return {
        "detected_emotion": detected_emotion,
        "guidance": guidance,
        "coping_strategies": coping_strategies
    }


def extract_coping_strategies(emotion: str) -> list:
    """Extract coping strategies for detected emotion"""
    strategies_map = {
        "angry": ["Take deep breaths", "Step away from the situation", "Journal your feelings", "Physical exercise"],
        "sad": ["Reach out to someone", "Engage in enjoyable activities", "Practice self-compassion", "Take care of yourself"],
        "anxious": ["Practice grounding techniques", "Deep breathing exercises", "Challenge worried thoughts", "Mindfulness meditation"],
        "happy": ["Celebrate the moment", "Share with others", "Reflect on what contributed", "Plan positive activities"],
        "calm": ["Maintain the routine", "Practice gratitude", "Continue healthy habits", "Share your peace"],
        "neutral": ["Explore your feelings", "Engage in meaningful activities", "Connect with others", "Practice mindfulness"],
    }

    return strategies_map.get(emotion.lower(), ["Practice self-care", "Seek support if needed"])
