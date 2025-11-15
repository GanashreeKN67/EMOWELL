import { useState, useRef, useEffect } from "react";
import Icon from "../common/Icon";
import AnalysisResult from "./AnalysisResult";
import { detectAudioEmotion } from "../../services/apiClient";

const AudioSupportPanel = () => {
  const [mode, setMode] = useState("record");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [isAudioPreviewVisible, setAudioPreviewVisible] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_EXTENSIONS = ["mp3", "wav", "ogg", "flac", "m4a"];

  useEffect(
    () => () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    },
    [audioPreviewUrl]
  );

  useEffect(() => {
    setAudioPreviewVisible(false);
  }, [mode]);

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    setSelectedFile(file || null);
    setFileName(file ? file.name : "");
    setResult(null);
    setErrorMessage("");
    setRecordedBlob(null);
    setAudioPreviewVisible(false);
    setAudioPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return file ? URL.createObjectURL(file) : "";
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setRecordedBlob(audioBlob);
        setAudioPreviewVisible(false);
        setAudioPreviewUrl((currentUrl) => {
          if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
          }
          return URL.createObjectURL(audioBlob);
        });
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setErrorMessage("");
      setResult(null);
    } catch (error) {
      setErrorMessage(
        "Could not access microphone. Please ensure microphone permissions are granted."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleAudioPreview = () => {
    if (!audioPreviewUrl) {
      return;
    }
    setAudioPreviewVisible((previous) => !previous);
  };

  const handleSubmitRecording = async () => {
    if (!recordedBlob) {
      setErrorMessage("Please record audio before submitting.");
      setResult(null);
      return;
    }

    if (recordedBlob.size > MAX_FILE_SIZE) {
      setErrorMessage(
        "That recording is larger than 10MB. Please record a shorter clip."
      );
      setResult(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const file = new File([recordedBlob], "recording.wav", {
        type: "audio/wav",
      });
      const payload = await detectAudioEmotion(file);
      setResult(
        Object.assign({}, payload, {
          modality: "Audio",
        })
      );
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage("Please choose an audio file before submitting.");
      setResult(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage(
        "That file is larger than 10MB. Please pick a smaller recording."
      );
      setResult(null);
      return;
    }

    const extension = selectedFile.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setErrorMessage(
        "Unsupported file type. Please upload a WAV, MP3, OGG, FLAC, or M4A file."
      );
      setResult(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload = await detectAudioEmotion(selectedFile);
      setResult(
        Object.assign({}, payload, {
          modality: "Audio",
        })
      );
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="audio-support">
      <header className="audio-support__header">
        <Icon type="microphone" />
        <div>
          <h3>Audio Support</h3>
          <p>
            Speak freely and let the dedicated audio model estimate the emotion
            in your voice without involving the chatbot.
          </p>
        </div>
      </header>
      <div
        className="audio-support__mode"
        role="tablist"
        aria-label="Audio support mode"
      >
        <button
          type="button"
          className={mode === "record" ? "active" : ""}
          onClick={() => setMode("record")}
          role="tab"
          aria-selected={mode === "record"}
        >
          Record now
        </button>
        <button
          type="button"
          className={mode === "upload" ? "active" : ""}
          onClick={() => setMode("upload")}
          role="tab"
          aria-selected={mode === "upload"}
        >
          Upload file
        </button>
      </div>
      {mode === "record" ? (
        <div className="audio-support__card">
          <p>
            When you are ready, press the button and speak for up to two
            minutes. The clip will be sent straight to the audio analyser.
          </p>
          <div className="audio-support__controls">
            <button
              type="button"
              className="btn btn--primary"
              onClick={startRecording}
              disabled={isRecording || isLoading}
            >
              {isRecording ? "Recording..." : "Start recording"}
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={stopRecording}
              disabled={!isRecording}
            >
              Stop
            </button>
            {recordedBlob && !isRecording ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleSubmitRecording}
                disabled={isLoading}
              >
                Analyse recording
              </button>
            ) : null}
          </div>
          {recordedBlob && !isRecording ? (
            <div className="audio-support__preview-controls">
              <p className="audio-support__file">
                Recording ready ({(recordedBlob.size / 1024).toFixed(2)} KB)
              </p>
              <button
                type="button"
                className="btn btn--outline"
                onClick={toggleAudioPreview}
                disabled={!audioPreviewUrl}
              >
                {isAudioPreviewVisible ? "Hide preview" : "Preview audio"}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="audio-support__card">
          <p>
            Drop an audio clip (MP3, WAV, OGG, FLAC, or M4A, up to 10MB) and
            receive the model's prediction in moments.
          </p>
          <label className="audio-support__uploader">
            <input type="file" accept="audio/*" onChange={handleFileChange} />
            <span>Browse files</span>
          </label>
          {fileName ? (
            <p className="audio-support__file">Selected: {fileName}</p>
          ) : null}
          {selectedFile ? (
            <button
              type="button"
              className="btn btn--outline"
              onClick={toggleAudioPreview}
              disabled={!audioPreviewUrl}
            >
              {isAudioPreviewVisible ? "Hide preview" : "Preview audio"}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Analyse audio
          </button>
        </div>
      )}
      {isAudioPreviewVisible && audioPreviewUrl ? (
        <div className="audio-support__preview-panel">
          <audio controls src={audioPreviewUrl} />
        </div>
      ) : null}
      {isLoading ? (
        <div className="analysis-status analysis-status--loading">
          <span className="analysis-status__spinner" aria-hidden="true" />
          Analysing your audio sample...
        </div>
      ) : null}
      {errorMessage ? (
        <div className="analysis-status analysis-status--error">
          {errorMessage}
        </div>
      ) : null}
      <AnalysisResult result={result} />
    </div>
  );
};

export default AudioSupportPanel;
