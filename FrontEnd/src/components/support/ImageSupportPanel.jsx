import { useEffect, useRef, useState } from "react";
import Icon from "../common/Icon";
import AnalysisResult from "./AnalysisResult";
import { detectImageEmotion } from "../../services/apiClient";
import AuthWall from "../auth/AuthWall";
import { useAuth } from "../../context/AuthContext";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

const ImageSupportPanel = () => {
  const { isAuthenticated } = useAuth();
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraOverlayOpen, setCameraOverlayOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isImagePreviewOpen, setImagePreviewOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const assignSelectedFile = (file) => {
    setSelectedFile(file || null);
    setFileName(file ? file.name : "");
    setResult(null);
    setErrorMessage("");
    setCameraError("");
    setImagePreviewOpen(false);
    setImagePreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return file ? URL.createObjectURL(file) : "";
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    assignSelectedFile(file || null);
  };

  const stopCamera = () => {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera access is not supported in this browser.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    });

    mediaStreamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
    setIsCameraActive(true);
    setCameraError("");
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setCameraError("Camera is not ready yet.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Unable to capture photo. Please try again.");
          return;
        }

        const capturedFile = new File([blob], "captured-photo.png", {
          type: "image/png",
          lastModified: Date.now(),
        });
        assignSelectedFile(capturedFile);
        closeCameraOverlay();
      },
      "image/png",
      0.92
    );
  };

  const closeCameraOverlay = () => {
    setCameraOverlayOpen(false);
    setCameraError("");
  };

  useEffect(
    () => () => {
      stopCamera();
    },
    []
  );

  useEffect(() => {
    if (!imagePreviewUrl) {
      return undefined;
    }
    return () => {
      URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (!isCameraOverlayOpen) {
      return undefined;
    }

    let canceled = false;
    const enableCamera = async () => {
      try {
        await startCamera();
      } catch (error) {
        if (!canceled) {
          setCameraError(
            error?.message ||
              "Unable to access the camera. Please check permissions."
          );
          setIsCameraActive(false);
        }
      }
    };

    enableCamera();

    return () => {
      canceled = true;
      stopCamera();
    };
  }, [isCameraOverlayOpen]);

  if (!isAuthenticated) {
    return (
      <AuthWall
        title="Sign in to use image support"
        description="Log in so we can store your photo insights privately and display them on your dashboard."
      />
    );
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage("Please choose an image before requesting an analysis.");
      setResult(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage(
        "Images must be 10MB or smaller. Please choose another file."
      );
      setResult(null);
      return;
    }

    const extension = selectedFile.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setErrorMessage(
        "Unsupported file type. Please upload a JPG, PNG, or WebP file."
      );
      setResult(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload = await detectImageEmotion({
        file: selectedFile,
      });
      setResult(
        Object.assign({}, payload, {
          modality: "Image",
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
    <div className="image-support">
      <header className="image-support__header">
        <Icon type="camera" />
        <div>
          <h3>Image Support</h3>
          <p>
            Upload a photo or screenshot and our image model will estimate the
            dominant emotion without routing through the chatbot.
          </p>
        </div>
      </header>
      <div className="image-support__card">
        <label className="image-support__uploader">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <span>Upload image</span>
        </label>
        {fileName ? (
          <p className="image-support__file">Selected: {fileName}</p>
        ) : null}
        <div className="image-support__controls">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Analyse image
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => setCameraOverlayOpen(true)}
          >
            Use camera
          </button>
          {imagePreviewUrl ? (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setImagePreviewOpen(true)}
            >
              Preview image
            </button>
          ) : null}
        </div>
      </div>
      <div className="image-support__feedback">
        {isLoading ? (
          <div className="analysis-status analysis-status--loading">
            <span className="analysis-status__spinner" aria-hidden="true" />
            Analysing your image sample...
          </div>
        ) : null}
        {errorMessage ? (
          <div className="analysis-status analysis-status--error">
            {errorMessage}
          </div>
        ) : null}
        {result ? (
          <div className="image-support__results">
            <h4>Results</h4>
            <AnalysisResult result={result} />
          </div>
        ) : null}
      </div>

      {isCameraOverlayOpen ? (
        <div className="image-support__overlay" role="dialog" aria-modal="true">
          <div className="image-support__overlay-content">
            <div className="image-support__overlay-header">
              <h4>Camera capture</h4>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={closeCameraOverlay}
              >
                Close
              </button>
            </div>
            <div className="image-support__overlay-body">
              <video ref={videoRef} playsInline muted autoPlay />
              <canvas ref={canvasRef} className="image-support__canvas" />
            </div>
            <div className="image-support__overlay-actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={capturePhoto}
                disabled={!isCameraActive}
              >
                Capture photo
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={closeCameraOverlay}
              >
                Cancel
              </button>
            </div>
            {cameraError ? (
              <p className="image-support__camera-error">{cameraError}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {isImagePreviewOpen && imagePreviewUrl ? (
        <div
          className="image-support__overlay image-support__overlay--preview"
          role="dialog"
          aria-modal="true"
        >
          <div className="image-support__overlay-content">
            <div className="image-support__overlay-header">
              <h4>Image preview</h4>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setImagePreviewOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="image-support__preview-frame">
              <img src={imagePreviewUrl} alt="Selected preview" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ImageSupportPanel;
