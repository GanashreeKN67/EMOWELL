import numpy as np
import joblib
from tensorflow.keras.models import load_model
from config import AUDIO_MODEL_PATH, AUDIO_SCALER_PATH, AUDIO_EMOTIONS
from services.preprocessing import get_audio_features_augmented
from utils.emotion_mapper import get_all_emotion_predictions
import tensorflow as tf

audio_model = None
audio_scaler = None


def load_audio_model():
    """Load pre-trained audio model with safe loading"""
    global audio_model, audio_scaler
    audio_scaler = None
    try:
        audio_model = tf.keras.models.load_model(
            AUDIO_MODEL_PATH,
            safe_mode=False,
        )
        print("OK Audio model loaded with safe_mode")

        if AUDIO_SCALER_PATH:
            audio_scaler_local = joblib.load(AUDIO_SCALER_PATH)
            print("OK Audio scaler loaded")
        else:
            audio_scaler_local = None

        audio_scaler = audio_scaler_local
        return True
    except Exception as e1:
        print(f"Safe mode failed: {e1}")
        try:
            audio_model = load_model(
                AUDIO_MODEL_PATH,
                compile=False,
            )
            audio_model.compile(
                optimizer="adam",
                loss="categorical_crossentropy",
                metrics=["accuracy"],
            )
            print("OK Audio model loaded without compile")

            if AUDIO_SCALER_PATH:
                audio_scaler_local = joblib.load(AUDIO_SCALER_PATH)
                print("OK Audio scaler loaded")
            else:
                audio_scaler_local = None

            audio_scaler = audio_scaler_local
            return True
        except Exception as e2:
            print(f"Error loading audio model: {e2}")
            return False


def predict_emotion_from_audio(audio_path: str) -> dict:
    """Predict emotion from audio"""
    global audio_model, audio_scaler

    if audio_model is None:
        if not load_audio_model():
            raise Exception("Audio model not loaded")

    features = get_audio_features_augmented(audio_path)

    if audio_scaler:
        features = audio_scaler.transform(features)

    features = np.expand_dims(features, axis=2)
    predictions = audio_model.predict(features, verbose=0)
    avg_predictions = np.mean(predictions, axis=0)

    emotion_idx = np.argmax(avg_predictions)
    emotion = AUDIO_EMOTIONS[emotion_idx] if emotion_idx < len(AUDIO_EMOTIONS) else "unknown"
    confidence = float(avg_predictions[emotion_idx])

    all_predictions = get_all_emotion_predictions(avg_predictions, AUDIO_EMOTIONS)

    return {
        "emotion": emotion,
        "confidence": confidence,
        "all_predictions": all_predictions
    }
