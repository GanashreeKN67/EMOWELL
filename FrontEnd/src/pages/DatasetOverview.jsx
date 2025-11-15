import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { datasetConfigs } from "../data/datasetOverviewData";

const datasetFilterIcons = {
  audio: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 10v4h4l5 4V6l-5 4H4z" fill="currentColor" opacity="0.9" />
      <path
        d="M16.5 8c1.6 1.4 2.5 3.4 2.5 5.5s-0.9 4.1-2.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M19.5 6.5c2.1 1.8 3.5 4.5 3.5 7.5s-1.4 5.7-3.5 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.2"
        ry="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7.5 15.5l3.2-4.2 3.4 4.4 2.5-2.5 3.4 4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    </svg>
  ),
};

const MetricCard = ({ label, value, detail }) => (
  <div className="dataset-metric">
    <p>{label}</p>
    <strong>{value}</strong>
    <span>{detail}</span>
  </div>
);

const AccuracyChart = ({ data }) => (
  <div className="dataset-card dataset-card--chart">
    <div className="dataset-card__header">
      <h4>Accuracy trend</h4>
      <span>Training vs validation</span>
    </div>
    <div className="dataset-card__chart dataset-card__chart--medium">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-soft)"
          />
          <XAxis dataKey="epoch" tick={{ fontSize: 12 }} />
          <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-tooltip)",
              borderRadius: 12,
              border: "1px solid var(--color-border-soft)",
              boxShadow: "var(--shadow-tooltip)",
              color: "var(--color-text-dark)",
            }}
            formatter={(value) => `${value}%`}
            labelFormatter={(label) => `Epoch ${label}`}
          />
          <Legend iconType="circle" />
          <Line
            type="monotone"
            dataKey="trainAccuracy"
            stroke="var(--color-chart-train)"
            strokeWidth={2}
            dot={false}
            name="Train accuracy"
          />
          <Line
            type="monotone"
            dataKey="valAccuracy"
            stroke="var(--color-chart-validation)"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 2"
            name="Validation accuracy"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const LossChart = ({ data }) => (
  <div className="dataset-card dataset-card--chart">
    <div className="dataset-card__header">
      <h4>Loss trend</h4>
      <span>Training vs validation</span>
    </div>
    <div className="dataset-card__chart dataset-card__chart--medium">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-soft)"
          />
          <XAxis dataKey="epoch" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-tooltip)",
              borderRadius: 12,
              border: "1px solid var(--color-border-soft)",
              boxShadow: "var(--shadow-tooltip)",
              color: "var(--color-text-dark)",
            }}
            labelFormatter={(label) => `Epoch ${label}`}
            formatter={(value) => Number(value).toFixed(3)}
          />
          <Legend iconType="circle" />
          <Line
            type="monotone"
            dataKey="trainLoss"
            stroke="var(--color-chart-loss-train)"
            strokeWidth={2}
            dot={false}
            name="Train loss"
          />
          <Line
            type="monotone"
            dataKey="valLoss"
            stroke="var(--color-chart-loss-validation)"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 4"
            name="Validation loss"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const EvaluationChart = ({ data }) => (
  <div className="dataset-card dataset-card--chart">
    <div className="dataset-card__header">
      <h4>Evaluation metrics by class</h4>
      <span>Precision, recall, and F1 in %</span>
    </div>
    <div className="dataset-card__chart dataset-card__chart--tall">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-soft)"
          />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis unit="%" domain={[0, 110]} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-tooltip)",
              borderRadius: 12,
              border: "1px solid var(--color-border-soft)",
              boxShadow: "var(--shadow-tooltip)",
              color: "var(--color-text-dark)",
            }}
            formatter={(value) => `${value}%`}
            labelFormatter={(label) => label.toUpperCase()}
          />
          <Legend iconType="circle" />
          <Bar
            dataKey="precision"
            fill="var(--color-primary)"
            radius={[6, 6, 0, 0]}
            name="Precision"
          />
          <Bar
            dataKey="recall"
            fill="var(--color-secondary)"
            radius={[6, 6, 0, 0]}
            name="Recall"
          />
          <Bar
            dataKey="f1"
            fill="var(--color-accent)"
            radius={[6, 6, 0, 0]}
            name="F1-score"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const DatasetOverview = () => {
  const [activeKey, setActiveKey] = useState("audio");
  const activeDataset = datasetConfigs[activeKey];

  const trainingSeries = useMemo(() => {
    return activeDataset.trainingSeries.filter((_, index) => index % 2 === 0);
  }, [activeDataset]);

  const evaluationHighlights = useMemo(() => {
    const bars = activeDataset.evaluationBars;
    const best = bars.reduce((prev, current) =>
      current.f1 > prev.f1 ? current : prev
    );
    const worst = bars.reduce((prev, current) =>
      current.f1 < prev.f1 ? current : prev
    );
    return [
      `${best.label.toUpperCase()} leads with ${
        best.f1
      }% F1, giving dependable predictions for that label.`,
      `${worst.label.toUpperCase()} is currently toughest at ${
        worst.f1
      }% F1, so we plan additional sampling there.`,
      `${activeDataset.samples.toLocaleString()} labelled samples feed this ${activeDataset.label.toLowerCase()} model during training.`,
    ];
  }, [activeDataset]);

  return (
    <div className="dataset-overview container">
      <header className="dataset-header">
        <div>
          <p className="eyebrow">Dataset insights</p>
          <h1>{activeDataset.name}</h1>
          <p>{activeDataset.description}</p>
        </div>
        <div
          className="dataset-filter"
          role="tablist"
          aria-label="Dataset modality"
        >
          {Object.values(datasetConfigs).map((config) => (
            <button
              key={config.key}
              type="button"
              role="tab"
              aria-selected={config.key === activeKey}
              className={config.key === activeKey ? "is-active" : undefined}
              onClick={() => setActiveKey(config.key)}
            >
              <span className="dataset-filter__icon" aria-hidden="true">
                {datasetFilterIcons[config.key] ?? null}
              </span>
              <span className="dataset-filter__label">{config.label}</span>
            </button>
          ))}
        </div>
      </header>

      <section className="dataset-row dataset-row--context">
        <div className="dataset-card dataset-card--story">
          <h4>Training context</h4>
          <p>
            The model trains for {activeDataset.trainingSeries.length} epochs
            with scheduled learning-rate drops and extensive augmentation to
            keep generalisation high.
          </p>
        </div>
      </section>

      <section className="dataset-row dataset-row--chart">
        <AccuracyChart data={trainingSeries} />
      </section>

      <section className="dataset-row dataset-row--chart">
        <LossChart data={trainingSeries} />
      </section>

      <section className="dataset-row dataset-row--evaluation">
        <EvaluationChart data={activeDataset.evaluationBars} />
        <div className="dataset-card dataset-card--metrics-panel">
          <h4>Key metrics</h4>
          <div className="dataset-card--metrics">
            {activeDataset.summaryStats.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="dataset-row dataset-row--takeaways">
        <div className="dataset-card dataset-card--story">
          <h4>Evaluation takeaways</h4>
          <ul className="dataset-highlights">
            {evaluationHighlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default DatasetOverview;
