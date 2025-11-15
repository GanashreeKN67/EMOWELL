import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
DEBUG = os.getenv("DEBUG", "False") == "True"
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# Model Paths
IMAGE_MODEL_PATH = os.getenv("IMAGE_MODEL_PATH", "./models_saved/best_fer2013_model.keras")
AUDIO_MODEL_PATH = os.getenv("AUDIO_MODEL_PATH", "./models_saved/audio_emotion_model.keras")
AUDIO_SCALER_PATH = os.getenv("AUDIO_SCALER_PATH", "./models_saved/scaler.pkl")

# Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# File Upload Settings
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_FORMATS = {'.jpg', '.jpeg', '.png'}
ALLOWED_AUDIO_FORMATS = {'.wav', '.mp3', '.ogg', '.flac', '.m4a', '.webm'}

# Audio Processing
AUDIO_SAMPLE_RATE = 22050
AUDIO_DURATION = 2.5
AUDIO_OFFSET = 0.6

# Image Processing
IMAGE_SIZE = (48, 48)

# Emotion Mappings
IMAGE_EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

AUDIO_EMOTIONS = ['angry', 'calm', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

# CBT Therapy Prompts
CBT_PROMPTS = {
    "anger": (
        "The user feels angry. As a CBT therapist, help them recognize triggers, validate their emotion, "
        "and suggest healthy coping strategies to release frustration. User note: '{user_note}'."
    ),
    "anxiety": (
        "The user feels anxious. As a CBT therapist, guide them to challenge irrational worries, focus on breathing, "
        "and use grounding techniques. User note: '{user_note}'."
    ),
    "bipolar": (
        "The user reports mood swings linked to bipolar experiences. Help them track triggers, maintain stability, "
        "and establish routines. User note: '{user_note}'."
    ),
    "depression": (
        "The user feels depressed or hopeless. Offer CBT-based help by identifying negative thinking, encouraging "
        "self-compassion, and suggesting small positive actions. User note: '{user_note}'."
    ),
    "fear": (
        "The user is feeling fearful. As a CBT therapist, explore what triggers the fear, challenge exaggerated thoughts, "
        "and guide them toward gradual exposure. User note: '{user_note}'."
    ),
    "calm": (
        "The user feels calm. As a CBT therapist, help them maintain this state by reinforcing positive patterns "
        "and encouraging mindfulness. User note: '{user_note}'."
    ),
    "happy": (
        "The user feels happy. As a CBT therapist, help them appreciate this positive emotion and identify what contributes "
        "to their well-being. User note: '{user_note}'."
    ),
    "sad": (
        "The user feels sad. Offer compassionate CBT support by exploring the sources of sadness and building coping strategies. "
        "User note: '{user_note}'."
    ),
    "neutral": (
        "The user expresses neutral emotions. As a CBT therapist, explore what's happening and help them engage positively "
        "with their environment. User note: '{user_note}'."
    ),
    "disgust": (
        "The user feels disgusted. Help them understand the source and use CBT to process this emotion constructively. "
        "User note: '{user_note}'."
    ),
    "surprise": (
        "The user feels surprised. Help them process this emotion and adjust to the new situation using CBT techniques. "
        "User note: '{user_note}'."
    ),
}

# Conversation History (for chatbot)
MAX_CONVERSATION_HISTORY = 10
