import numpy as np
from tensorflow.keras.models import load_model
from config import IMAGE_MODEL_PATH, IMAGE_EMOTIONS
from services.preprocessing import preprocess_image
from utils.emotion_mapper import get_all_emotion_predictions
import tensorflow as tf

image_model = None


def load_image_model():
    """Load pre-trained image model with safe loading"""
    global image_model
    try:
        image_model = tf.keras.models.load_model(
            IMAGE_MODEL_PATH,
            safe_mode=False,
        )
        print("OK Image model loaded with safe_mode")
        return True
    except Exception as e1:
        print(f"Safe mode failed: {e1}")
        try:
            image_model = load_model(
                IMAGE_MODEL_PATH,
                compile=False,
            )
            image_model.compile(
                optimizer="adam",
                loss="categorical_crossentropy",
                metrics=["accuracy"],
            )
            print("OK Image model loaded without compile")
            return True
        except Exception as e2:
            print(f"Error loading image model: {e2}")
            return False


def predict_emotion_from_image(image_path: str) -> dict:
    """Predict emotion from image"""
    global image_model

    if image_model is None:
        if not load_image_model():
            raise Exception("Image model not loaded")

    img = preprocess_image(image_path)
    predictions = image_model.predict(img, verbose=0)[0]

    emotion_idx = np.argmax(predictions)
    emotion = IMAGE_EMOTIONS[emotion_idx] if emotion_idx < len(IMAGE_EMOTIONS) else "unknown"
    confidence = float(predictions[emotion_idx])

    all_predictions = get_all_emotion_predictions(predictions, IMAGE_EMOTIONS)

    return {
        "emotion": emotion,
        "confidence": confidence,
        "all_predictions": all_predictions
    }
