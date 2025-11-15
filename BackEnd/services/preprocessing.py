import numpy as np
import cv2
import librosa
from config import AUDIO_SAMPLE_RATE, AUDIO_DURATION, AUDIO_OFFSET, IMAGE_SIZE


def preprocess_image(image_path: str) -> np.ndarray:
    """Preprocess image for model prediction"""
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)

    if img is None:
        raise ValueError("Could not read image file")

    if len(img.shape) == 3:
        channels = img.shape[2]
        if channels == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
        else:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    img = cv2.resize(img, IMAGE_SIZE)
    img = img / 255.0
    img = np.expand_dims(img, axis=-1)
    img = np.expand_dims(img, axis=0)

    return img


def load_and_process_audio(audio_path: str) -> np.ndarray:
    """Load and process audio file"""
    data, sr = librosa.load(audio_path, sr=AUDIO_SAMPLE_RATE, duration=AUDIO_DURATION, offset=AUDIO_OFFSET)
    return data, sr


def extract_audio_features(data: np.ndarray, sr: int) -> np.ndarray:
    """Extract 162 audio features"""
    features = []

    # Zero Crossing Rate
    zcr = np.mean(librosa.feature.zero_crossing_rate(y=data))
    features.append(zcr)

    # Chroma STFT
    chroma = np.mean(librosa.feature.chroma_stft(y=data, sr=sr), axis=1)
    features.extend(chroma)

    # MFCC
    mfcc = np.mean(librosa.feature.mfcc(y=data, sr=sr, n_mfcc=20), axis=1)
    features.extend(mfcc)

    # RMS Energy
    rms = np.mean(librosa.feature.rms(y=data))
    features.append(rms)

    # Mel Spectrogram
    mel = np.mean(librosa.feature.melspectrogram(y=data, sr=sr), axis=1)
    features.extend(mel)

    return np.array(features, dtype=np.float32)


def get_audio_features_augmented(audio_path: str) -> np.ndarray:
    """Extract features from 3 augmented versions of audio"""
    data, sr = load_and_process_audio(audio_path)

    # Original
    res1 = extract_audio_features(data, sr)
    result = np.array(res1, dtype=np.float32)

    # With noise
    noise_data = add_noise(data)
    res2 = extract_audio_features(noise_data, sr)
    result = np.vstack((result, res2))

    # With stretch and pitch
    stretched_data = librosa.effects.time_stretch(data, rate=0.8)
    pitched_data = librosa.effects.pitch_shift(stretched_data, sr=sr, n_steps=2)
    res3 = extract_audio_features(pitched_data, sr)
    result = np.vstack((result, res3))

    return result


def add_noise(data: np.ndarray) -> np.ndarray:
    """Add Gaussian noise to audio"""
    noise_amp = 0.035 * np.random.uniform() * np.max(np.abs(data))
    noise = noise_amp * np.random.normal(size=data.shape[0])
    return data + noise
