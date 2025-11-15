import os
from config import ALLOWED_IMAGE_FORMATS, ALLOWED_AUDIO_FORMATS, MAX_FILE_SIZE


def validate_image_file(file_path: str, file_name: str) -> tuple[bool, str]:
    """Validate image file"""
    if not os.path.exists(file_path):
        return False, "File not found"

    file_extension = os.path.splitext(file_name)[1].lower()
    if file_extension not in ALLOWED_IMAGE_FORMATS:
        return False, f"Invalid image format. Allowed: {ALLOWED_IMAGE_FORMATS}"

    file_size = os.path.getsize(file_path)
    if file_size > MAX_FILE_SIZE:
        return False, f"File size exceeds {MAX_FILE_SIZE / 1024 / 1024}MB limit"

    return True, "Valid"


def validate_audio_file(file_path: str, file_name: str) -> tuple[bool, str]:
    """Validate audio file"""
    if not os.path.exists(file_path):
        return False, "File not found"

    file_extension = os.path.splitext(file_name)[1].lower()
    if file_extension not in ALLOWED_AUDIO_FORMATS:
        return False, f"Invalid audio format. Allowed: {ALLOWED_AUDIO_FORMATS}"

    file_size = os.path.getsize(file_path)
    if file_size > MAX_FILE_SIZE:
        return False, f"File size exceeds {MAX_FILE_SIZE / 1024 / 1024}MB limit"

    return True, "Valid"


def validate_text_input(text: str) -> tuple[bool, str]:
    """Validate text input"""
    if not text or len(text.strip()) == 0:
        return False, "Text cannot be empty"

    if len(text) > 2000:
        return False, "Text exceeds maximum length of 2000 characters"

    return True, "Valid"
