import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Icon from "../common/Icon";
import "../../styles/suggestions-panel.css";

const SuggestionsPanel = ({ suggestions, emotion, confidence, modality }) => {
  const [activeTab, setActiveTab] = useState("immediate");

  if (!suggestions) {
    return null;
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-success";
    if (confidence >= 0.6) return "text-primary";
    if (confidence >= 0.4) return "text-warning";
    return "text-danger";
  };

  const getEmotionIcon = (emotion) => {
    const iconMap = {
      happy: "smile",
      sad: "frown",
      angry: "fire",
      fear: "alert",
      surprise: "zap",
      disgust: "x-circle",
      neutral: "minus-circle",
      calm: "heart",
      anxious: "alert-circle",
    };
    return iconMap[emotion?.toLowerCase()] || "circle";
  };

  const tabs = [
    {
      id: "immediate",
      label: "Immediate Actions",
      icon: "zap",
      content: suggestions.immediate_actions || [],
    },
    {
      id: "coping",
      label: "Coping Strategies",
      icon: "shield",
      content: suggestions.coping_strategies || [],
    },
    {
      id: "longterm",
      label: "Long-term",
      icon: "trending-up",
      content: suggestions.long_term_recommendations || [],
    },
  ];

  return (
    <div className="suggestions-panel">
      <div className="suggestions-panel__header">
        <div className="suggestions-panel__emotion">
          <Icon type={getEmotionIcon(emotion)} />
          <div>
            <h3>Personalized Guidance</h3>
            <p className="suggestions-panel__meta">
              <span className="emotion-tag">
                <Icon type={getEmotionIcon(emotion)} size="small" />
                {emotion} • {modality}
              </span>
              <span className={`confidence-badge ${getConfidenceColor(confidence)}`}>
                {(confidence * 100).toFixed(0)}% confidence
              </span>
            </p>
          </div>
        </div>
      </div>

      {suggestions.personalized_insight && (
        <div className="suggestions-panel__insight">
          <div className="insight-card">
            <Icon type="lightbulb" />
            <div>
              <h4>Personal Insight</h4>
              <ReactMarkdown>{suggestions.personalized_insight}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      <div className="suggestions-panel__tabs">
        <div className="tab-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-nav__item ${
                activeTab === tab.id ? "tab-nav__item--active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon type={tab.icon} size="small" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab-panel ${
                activeTab === tab.id ? "tab-panel--active" : ""
              }`}
            >
              <div className="suggestions-list">
                {tab.content.length > 0 ? (
                  <ul>
                    {tab.content.map((suggestion, index) => (
                      <li key={index} className="suggestion-item">
                        <Icon type="check-circle" size="small" />
                        <ReactMarkdown>{suggestion}</ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-suggestions">
                    No {tab.label.toLowerCase()} available for this analysis.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {suggestions.confidence_note && (
        <div className="suggestions-panel__footer">
          <div className="confidence-note">
            <Icon type="info" size="small" />
            <span>{suggestions.confidence_note}</span>
          </div>
        </div>
      )}

      {suggestions.emotion_intensity && (
        <div className="emotion-intensity">
          <span className="intensity-label">
            Emotion Intensity: <strong>{suggestions.emotion_intensity}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default SuggestionsPanel;