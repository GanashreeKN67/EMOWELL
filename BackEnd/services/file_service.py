import os
import tempfile
from pathlib import Path


def save_upload_file(file) -> str:
    """Save uploaded file to temporary location"""
    try:
        suffix = Path(file.filename).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            contents = file.file.read()
            tmp.write(contents)
            return tmp.name
    except Exception as e:
        raise Exception(f"Error saving file: {str(e)}")


def cleanup_file(file_path: str):
    """Delete temporary file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error cleaning up file: {e}")
