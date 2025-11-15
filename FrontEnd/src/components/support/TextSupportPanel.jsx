import { useState } from "react";
import Icon from "../common/Icon";
import { detectTextEmotion } from "../../services/apiClient";
import AnalysisResult from "./AnalysisResult";
import { evaluationQuestions, moodOptions } from "../../data/supportData";

const TextSupportPanel = () => {
  const [selectedMood, setSelectedMood] = useState("fear");
  const [mode, setMode] = useState("guidance");
  const [note, setNote] = useState("");
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedMoodLabel =
    moodOptions.find((item) => item.id === selectedMood)?.label ?? "";

  const handleEvaluate = async (event) => {
    event.preventDefault();

    // Format evaluation responses as text for API
    const evaluationText = evaluationQuestions
      .map((question) => {
        const answer = responses[question.id];
        const option = question.options.find((opt) => opt.value === answer);
        return `${question.prompt}\nAnswer: ${option?.label || answer}`;
      })
      .join("\n\n");

    setIsLoading(true);
    setErrorMessage("");
    setSubmitted(false);

    try {
      const payload = await detectTextEmotion({
        text: evaluationText,
        userNote: selectedMoodLabel
          ? `Selected mood: ${selectedMoodLabel} (Self-evaluation)`
          : "Self-evaluation",
      });
      setResult(
        Object.assign({}, payload, {
          modality: "Text",
          user_note: selectedMoodLabel
            ? `Selected mood: ${selectedMoodLabel} (Self-evaluation)`
            : "Self-evaluation",
        })
      );
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (value) => {
    setMode(value);
    setSubmitted(false);
  };

  const handleSend = async () => {
    if (!note.trim()) {
      setErrorMessage(
        "Please enter a message before sending it to the text analyser."
      );
      setResult(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload = await detectTextEmotion({
        text: note.trim(),
        userNote: selectedMoodLabel
          ? `Selected mood: ${selectedMoodLabel}`
          : undefined,
      });
      setResult(
        Object.assign({}, payload, {
          modality: "Text",
          user_note: selectedMoodLabel
            ? `Selected mood: ${selectedMoodLabel}`
            : undefined,
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
    <div className="text-support">
      <header className="text-support__header">
        <span className="text-support__emoji" aria-hidden="true">
          😀
        </span>
        <div>
          <h3>Mentify · Select Your Mood</h3>
          <p>
            Let us know how you feel so we can personalise the text model's
            response.
          </p>
        </div>
      </header>
      <div className="mood-grid" role="list">
        {moodOptions.map((mood) => (
          <button
            key={mood.id}
            type="button"
            className={`mood-button ${
              selectedMood === mood.id ? "is-active" : ""
            }`}
            onClick={() => {
              setSelectedMood(mood.id);
              setSubmitted(false);
            }}
          >
            <span className="mood-button__emoji" aria-hidden="true">
              {mood.emoji}
            </span>
            <span>{mood.label}</span>
          </button>
        ))}
      </div>
      <div className="mood-banner" role="status">
        You selected mood: <strong>{selectedMoodLabel}</strong>
      </div>
      <div
        className="mode-toggle"
        role="tablist"
        aria-label="Text support mode"
      >
        <button
          type="button"
          className={mode === "guidance" ? "active" : ""}
          onClick={() => handleModeChange("guidance")}
          role="tab"
          aria-selected={mode === "guidance"}
        >
          Get Guidance
        </button>
        <button
          type="button"
          className={mode === "evaluate" ? "active" : ""}
          onClick={() => handleModeChange("evaluate")}
          role="tab"
          aria-selected={mode === "evaluate"}
        >
          Evaluate
        </button>
      </div>
      {mode === "guidance" ? (
        <div className="guidance-panel">
          <h4>Guidance</h4>
          <label htmlFor="guidance-note">
            Optional note (more context helps):
          </label>
          <textarea
            id="guidance-note"
            placeholder="Share anything the analyser should know before responding."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="guidance-panel__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSend}
              disabled={isLoading}
            >
              Send
            </button>
          </div>
          <div className="guidance-feed" aria-live="polite">
            <Icon type="chat" />
            <p>
              Results appear below with the detected emotion, confidence, and
              coping strategies.
            </p>
          </div>
          {isLoading ? (
            <div className="analysis-status analysis-status--loading">
              <span className="analysis-status__spinner" aria-hidden="true" />
              Analysing your text...
            </div>
          ) : null}
          {errorMessage ? (
            <div className="analysis-status analysis-status--error">
              {errorMessage}
            </div>
          ) : null}
          <AnalysisResult result={result} />
        </div>
      ) : (
        <form className="evaluation" onSubmit={handleEvaluate}>
          <h4>Self-evaluation</h4>
          <p className="evaluation__intro">
            Answer the following questions related to the selected mood. Your
            responses stay private.
          </p>
          {evaluationQuestions.map((question) => (
            <fieldset key={question.id} className="question-card">
              <legend>{question.prompt}</legend>
              <div className="question-card__options">
                {question.options.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={responses[question.id] === option.value}
                      onChange={() =>
                        setResponses((prev) => ({
                          ...prev,
                          [question.id]: option.value,
                        }))
                      }
                      required={!responses[question.id]}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isLoading}
          >
            Evaluate
          </button>
          {isLoading ? (
            <div className="analysis-status analysis-status--loading">
              <span className="analysis-status__spinner" aria-hidden="true" />
              Analysing your evaluation...
            </div>
          ) : null}
          {errorMessage ? (
            <div className="analysis-status analysis-status--error">
              {errorMessage}
            </div>
          ) : null}
          {submitted && result ? (
            <p className="evaluation__note">
              Thank you for sharing. Review your emotion analysis below.
            </p>
          ) : null}
          <AnalysisResult result={result} />
        </form>
      )}
    </div>
  );
};

export default TextSupportPanel;
