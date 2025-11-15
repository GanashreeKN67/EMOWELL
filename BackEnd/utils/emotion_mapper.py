from config import IMAGE_EMOTIONS, AUDIO_EMOTIONS


def map_image_emotion(emotion_index: int) -> str:
    """Map image model output to emotion name"""
    if 0 <= emotion_index < len(IMAGE_EMOTIONS):
        return IMAGE_EMOTIONS[emotion_index]
    return "unknown"


def map_audio_emotion(emotion_index: int) -> str:
    """Map audio model output to emotion name"""
    if 0 <= emotion_index < len(AUDIO_EMOTIONS):
        return AUDIO_EMOTIONS[emotion_index]
    return "unknown"


def get_all_emotion_predictions(predictions: list, emotions_list: list) -> dict:
    """Convert prediction array to emotion-probability dictionary"""
    result = {}
    for idx, prob in enumerate(predictions):
        if idx < len(emotions_list):
            result[emotions_list[idx]] = float(prob)
    return result
