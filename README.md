EMOWELL – Multimodal Emotion Recognition and Mental Health Support System  

This project implements an AI-based multimodal emotion recognition system that analyzes user emotions from text, audio, and image inputs and provides personalized Cognitive Behavioral Therapy (CBT)-based guidance. It leverages deep learning, natural language processing, and generative AI to support mental well-being in a confidential, real-time, and accessible manner.

📌 Project Overview  
The EMOWELL system is designed to detect and interpret emotions using three different modalities:

🗣️ Audio Emotion Recognition  
Uses a hybrid CNN–LSTM model trained on benchmark emotional speech datasets such as RAVDESS, TESS, CREMA-D, and SAVEE. It extracts features like MFCC, Mel-spectrogram, Chroma, ZCR, and RMS to classify emotions such as:
- Angry  
- Happy  
- Sad  
- Fear  
- Neutral  
- Surprise  

🖼️ Image Emotion Recognition  
Uses a CNN model trained on the FER2013 dataset to classify facial expressions into:
- Angry  
- Disgust  
- Fear  
- Happy  
- Neutral  
- Sad  
- Surprise  

💬 Text Emotion & CBT Support  
Instead of a trained classifier, this module uses Google Gemini API to interpret user-provided emotional context and generate empathetic, structured CBT-based responses. Users can also select moods manually through a guided interface.

The system also includes interactive dashboards that visualize emotional trends over time, helping users reflect on their emotional well-being.

🗂️ Repository Structure  

EMOWELL/  
├── Frontend/  
│   ├── src/                   # React-based user interface  
│   └── public/                # Static assets  
│  
├── Backend/  
│   ├── main.py                # FastAPI backend  
│   ├── auth.py                # Authentication module  
│   └── requirements.txt       # Python dependencies  
│  
├── Models/  
│   ├── audio_emotion_model.keras  
│   ├── image_emotion_model.keras  
│   └── model_training_notebooks/  
│       ├── audio_model.ipynb  
│       └── image_model.ipynb  
│  
├── Dataset/  
│   ├── Audio/ (RAVDESS, TESS, CREMA-D, SAVEE)  
│   └── Image/ (FER2013)  
│  
└── README.md                  # Project documentation (this file)

⚙️ Setup Instructions  

Follow these steps to get the project up and running:

1. Clone the repository  

git clone https://github.com/GanashreeKN67/EMOWELL.git  
cd EMOWELL  

2. Backend Setup  

cd Backend  
conda create -n emowell-env python=3.10  
conda activate emowell-env  
pip install -r requirements.txt  
uvicorn main:app --reload  

3. Frontend Setup  

cd Frontend  
npm install  
npm start  

4. Add and Setup .env file in Backend/  

Use the following format:

MONGO_URI = <your_mongodb_connection_string>  
JWT_SECRET = <your_jwt_secret>  
GEMINI_API_KEY = <your_google_gemini_api_key>  

5. Run Application  

Open browser and navigate to:  
http://localhost:3000  

Technologies Used  

Frontend: React, Tailwind CSS  
Backend: FastAPI  
Machine Learning: TensorFlow / Keras  
Database: MongoDB  
Generative AI: Google Gemini API  
Feature Extraction: Librosa  
Visualization: Chart.js / Matplotlib  

Model Performance  

Audio Model: CNN–LSTM  
Image Model: CNN  
Evaluation Metrics: Accuracy, Precision, Recall, F1-score  
Dashboard provides real-time confidence scores and emotion trends  

Key Features  

✔ Multimodal emotion detection (Text, Audio, Image)  
✔ Real-time emotion analysis with confidence score  
✔ Personalized CBT-based mental health guidance  
✔ Secure user authentication using JWT  
✔ Interactive dashboards for emotional tracking  
✔ Scalable and modular architecture  

Contact  

Ganashree K N  
ganashree99045@gmail.com  
https://www.linkedin.com/in/ganashree-k-n-37a53633b/  
