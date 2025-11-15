import { useState, useRef, useEffect } from "react";
import Icon from "../common/Icon";
import AnalysisResult from "./AnalysisResult";
import { detectAudioEmotion } from "../../services/apiClient";

const getAudioContext = () => {
  if (typeof window === "undefined") {
    throw new Error("Audio capture is only available in the browser.");
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("This browser does not support audio processing.");
  }
  return new AudioContextClass();
};

const floatTo16BitPCM = (view, offset, input) => {
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
};

const interleaveChannels = (audioBuffer) => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  if (numberOfChannels === 1) {
    return audioBuffer.getChannelData(0);
  }

  const length = audioBuffer.length * numberOfChannels;
  const result = new Float32Array(length);
  const channels = [];
  for (let i = 0; i < numberOfChannels; i += 1) {
    channels.push(audioBuffer.getChannelData(i));
  }

  let writeIndex = 0;
  for (
    let sampleIndex = 0;
    sampleIndex < audioBuffer.length;
    sampleIndex += 1
  ) {
    for (
      let channelIndex = 0;
      channelIndex < numberOfChannels;
      channelIndex += 1
    ) {
      result[writeIndex] = channels[channelIndex][sampleIndex];
      writeIndex += 1;
    }
  }

  return result;
};

const audioBufferToWavArrayBuffer = (audioBuffer) => {
  const headerLength = 44;
  const bytesPerSample = 2;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const interleaved = interleaveChannels(audioBuffer);
  const dataLength = interleaved.length * bytesPerSample;
  const buffer = new ArrayBuffer(headerLength + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset, text) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
  view.setUint16(32, numberOfChannels * bytesPerSample, true);
  view.setUint16(34, 8 * bytesPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  floatTo16BitPCM(view, headerLength, interleaved);

  return buffer;
};

const convertBlobToWavFile = async (blob) => {
  const audioContext = getAudioContext();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavArrayBuffer = audioBufferToWavArrayBuffer(audioBuffer);
    return new File([wavArrayBuffer], "recording.wav", { type: "audio/wav" });
  } finally {
    if (typeof audioContext.close === "function") {
      await audioContext.close();
    }
  }
};

const AudioSupportPanel = () => {
  const [mode, setMode] = useState("record");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFile, setRecordedFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [isAudioPreviewVisible, setAudioPreviewVisible] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const hasRecording = Boolean(recordedFile);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_EXTENSIONS = ["mp3", "wav", "ogg", "flac", "m4a", "webm"];

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
    setRecordedFile(null);
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
      try {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });
      } catch (recorderError) {
        mediaRecorderRef.current = new MediaRecorder(stream);
      }
      audioChunksRef.current = [];
      setRecordedFile(null);
      setAudioPreviewVisible(false);
      setAudioPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
        return "";
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const mimeType =
          mediaRecorderRef.current && mediaRecorderRef.current.mimeType
            ? mediaRecorderRef.current.mimeType
            : "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });
        try {
          const wavFile = await convertBlobToWavFile(audioBlob);
          setRecordedFile(wavFile);
          setAudioPreviewVisible(false);
          setAudioPreviewUrl((currentUrl) => {
            if (currentUrl) {
              URL.revokeObjectURL(currentUrl);
            }
            return URL.createObjectURL(wavFile);
          });
          setErrorMessage("");
        } catch (conversionError) {
          console.error("Recording conversion failed", conversionError);
          setRecordedFile(null);
          setAudioPreviewUrl((currentUrl) => {
            if (currentUrl) {
              URL.revokeObjectURL(currentUrl);
            }
            return "";
          });
          setErrorMessage(
            "We couldn't process that recording. Please try again or upload an audio file."
          );
        } finally {
          stream.getTracks().forEach((track) => track.stop());
        }
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

  const handleReRecord = () => {
    if (isRecording) {
      return;
    }
    setRecordedFile(null);
    setAudioPreviewVisible(false);
    setAudioPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return "";
    });
    audioChunksRef.current = [];
    setErrorMessage("");
    setResult(null);
  };

  const handleSubmitRecording = async () => {
    if (!recordedFile) {
      setErrorMessage("Please record audio before submitting.");
      setResult(null);
      return;
    }

    if (recordedFile.size > MAX_FILE_SIZE) {
      setErrorMessage(
        "That recording is larger than 10MB. Please record a shorter clip."
      );
      setResult(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload = await detectAudioEmotion(recordedFile);
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
        "Unsupported file type. Please upload a WAV, MP3, OGG, FLAC, M4A, or WEBM file."
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
          {hasRecording && !isRecording ? (
            <p className="audio-support__file">
              Recording ready ({(recordedFile.size / 1024).toFixed(2)} KB)
            </p>
          ) : null}
          <div className="audio-support__controls">
            {!hasRecording ? (
              <>
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
              </>
            ) : null}
            {hasRecording && !isRecording ? (
              <>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={toggleAudioPreview}
                  disabled={!audioPreviewUrl}
                >
                  {isAudioPreviewVisible ? "Hide preview" : "Preview audio"}
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleSubmitRecording}
                  disabled={isLoading}
                >
                  Analyse recording
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={handleReRecord}
                >
                  Re-record audio
                </button>
              </>
            ) : null}
          </div>
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
