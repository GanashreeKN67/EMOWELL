import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import ReactMarkdown from "react-markdown";
import SuggestionsPanel from "./SuggestionsPanel";

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return null;
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString();
};

const titleCase = (value) => {
  if (!value) {
    return "Unknown";
  }
  return value.slice(0, 1).toUpperCase() + value.slice(1);
};

const COLORS = [
  "#0066cc",
  "#17c6d0",
  "#4da6ff",
  "#5eb3ff",
  "#17d6e0",
  "#3399ff",
  "#1e90ff",
];

const AnalysisResult = ({ result }) => {
  if (!result) {
    return null;
  }

  const predictions = result.all_predictions || result.predictions || {};
  const strategies = result.coping_strategies || [];
  const timestampLabel = formatTimestamp(result.timestamp);
  const rawEmotion = result.detected_emotion || result.emotion;
  const modality = result.emotion_type || result.modality || "Unknown";
  const confidence =
    typeof result.confidence === "number" ? result.confidence * 100 : 0;

  // Prepare data for pie chart
  const chartData = Object.entries(predictions).map(([emotion, value]) => ({
    name: titleCase(emotion),
    value: typeof value === "number" ? value * 100 : 0,
  }));

  const showChart =
    chartData.length > 0 && (modality === "Audio" || modality === "Image");

  return (
    <section className="analysis-result" aria-live="polite">
      <header>
        <p className="analysis-result__type">
          Modality analysed: <strong>{titleCase(modality)}</strong>
        </p>
        <h4>Detected emotion</h4>
        <div className="analysis-result__emotion-bar">
          <div className="analysis-result__emotion-label">
            {titleCase(rawEmotion)}
          </div>
          <div className="analysis-result__progress-container">
            <div
              className="analysis-result__progress-fill"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <div className="analysis-result__percentage">
            {Math.round(confidence)}%
          </div>
        </div>
        {timestampLabel ? (
          <p className="analysis-result__timestamp">
            Generated {timestampLabel}
          </p>
        ) : null}
        {result.user_note ? (
          <p className="analysis-result__note">{result.user_note}</p>
        ) : null}
      </header>

      {showChart ? (
        <div className="analysis-result__chart">
          <h5>Emotion Distribution</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {result.guidance ? (
        <div className="analysis-result__guidance">
          <h5>Guidance</h5>
          <div className="markdown-content">
            <ReactMarkdown>{result.guidance}</ReactMarkdown>
          </div>
        </div>
      ) : null}

      {strategies.length > 0 ? (
        <div className="analysis-result__strategies">
          <h5>Coping strategies</h5>
          <ul>
            {strategies.map((strategy) => (
              <li key={strategy}>{strategy}</li>
            ))}
          </ul>
        </div>
      ) : null}
      
      {/* Add personalized suggestions panel */}
      {result.suggestions && (
        <SuggestionsPanel 
          suggestions={result.suggestions}
          emotion={rawEmotion}
          confidence={result.confidence}
          modality={modality}
        />
      )}
    </section>
  );
};

export default AnalysisResult;
