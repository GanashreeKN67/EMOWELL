import { useEffect, useMemo, useRef, useState } from "react";
import {
  decidePendingUser,
  fetchDashboardOverview,
  fetchPendingUsers,
} from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const modalityColorScale = {
  text: "var(--color-chart-train)",
  audio: "var(--color-chart-loss-train)",
  image: "var(--color-chart-validation)",
  chatbot: "var(--color-chart-loss-validation)",
};

const emotionPalette = [
  "var(--color-chart-train)",
  "var(--color-chart-loss-train)",
  "var(--color-chart-validation)",
  "var(--color-chart-loss-validation)",
  "var(--color-primary)",
  "var(--color-accent)",
  "#8b5cf6",
  "#f97316",
];

const DEFAULT_RANGE_OPTIONS = [7, 30, 90];

const Dashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [rangeDays, setRangeDays] = useState(7);
  const isAdmin = user?.role === "admin";
  const initialLoadRef = useRef(true);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (initialLoadRef.current) {
        setIsLoading(true);
      } else {
        setIsTransitioning(true);
      }
      setErrorMessage("");
      try {
        const payload = await fetchDashboardOverview(rangeDays);
        if (isActive) {
          setOverview(payload);
          if (isAdmin) {
            const pendingPayload = await fetchPendingUsers();
            if (isActive) {
              setPendingUsers(pendingPayload.pending || []);
            }
          }
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(error.message || "Unable to load dashboard data.");
        }
      } finally {
        if (isActive) {
          if (initialLoadRef.current) {
            setIsLoading(false);
            initialLoadRef.current = false;
          }
          setIsTransitioning(false);
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [isAdmin, rangeDays]);

  const rangeFilters = useMemo(() => {
    const source = overview?.available_ranges?.length
      ? overview.available_ranges
      : DEFAULT_RANGE_OPTIONS;
    return source.map((value) => {
      if (value === 7) {
        return { value, label: "Last 7 days" };
      }
      if (value === 30) {
        return { value, label: "Last 30 days" };
      }
      if (value === 90) {
        return { value, label: "Last 3 months" };
      }
      return { value, label: `Last ${value} days` };
    });
  }, [overview]);

  const handleRangeChange = (value) => {
    if (value !== rangeDays) {
      if (!initialLoadRef.current) {
        setIsTransitioning(true);
      }
      setRangeDays(value);
    }
  };

  const summaryCards = useMemo(() => {
    if (!overview) {
      return [];
    }
    const { summary } = overview;
    return [
      {
        label: "Total interactions",
        value: summary.total_interactions,
        detail: "Captured across text, audio, image, and chatbot",
      },
      {
        label: "Active days",
        value: summary.active_days,
        detail: "Days with at least one logged signal",
      },
      {
        label: "Current streak",
        value: `${summary.streak_days} days`,
        detail: "Keep the streak alive with one entry a day",
      },
      {
        label: "Last active",
        value: summary.last_active
          ? new Date(summary.last_active).toLocaleString()
          : "No activity yet",
        detail: summary.last_active
          ? "Timestamp of the latest entry"
          : "Run your first analysis to populate this",
      },
    ];
  }, [overview]);

  const heroChips = useMemo(() => {
    if (!overview) {
      return [];
    }
    return [
      { label: "Role", value: user?.role ?? "user" },
      { label: "Status", value: user?.status ?? "pending" },
      { label: "Modalities", value: `${overview.modalities.length}+` },
    ];
  }, [overview, user]);

  const heroMetrics = useMemo(() => {
    if (!overview) {
      return [];
    }
    const { summary } = overview;
    return [
      {
        label: "Current streak",
        value: `${summary.streak_days} days`,
      },
      {
        label: "Last active",
        value: summary.last_active
          ? new Date(summary.last_active).toLocaleDateString()
          : "No entries yet",
      },
    ];
  }, [overview]);

  const emotionChartData = useMemo(() => {
    if (!overview?.emotion_series?.length) {
      return [];
    }
    return overview.emotion_series.map((entry) => ({
      date: entry.date,
      ...(entry.emotions || {}),
    }));
  }, [overview]);

  const emotionKeys = useMemo(() => {
    if (overview?.top_emotions?.length) {
      return overview.top_emotions;
    }
    if (overview?.emotion_series?.length) {
      return Object.keys(overview.emotion_series[0].emotions || {});
    }
    return [];
  }, [overview]);

  const emotionColorMap = useMemo(() => {
    if (!emotionKeys.length) {
      return {};
    }
    const colorMap = {};
    emotionKeys.forEach((emotion, index) => {
      colorMap[emotion] = emotionPalette[index % emotionPalette.length];
    });
    return colorMap;
  }, [emotionKeys]);

  const dailyWithRolling = useMemo(() => {
    if (!overview) {
      return [];
    }
    const smoothingWindow = 3;
    return overview.daily.map((entry, index, source) => {
      const start = Math.max(0, index - (smoothingWindow - 1));
      const windowSlice = source.slice(start, index + 1);
      const avg =
        windowSlice.reduce((sum, item) => sum + (item.total || 0), 0) /
        (windowSlice.length || 1);
      return {
        ...entry,
        rollingAvg: Number(avg.toFixed(2)),
      };
    });
  }, [overview]);

  const momentumSeries = useMemo(() => {
    if (!dailyWithRolling.length) {
      return [];
    }
    const start = Math.max(0, dailyWithRolling.length - 7);
    return dailyWithRolling.slice(start);
  }, [dailyWithRolling]);

  const modalityPieData = useMemo(() => {
    if (!overview) {
      return [];
    }
    return overview.modalities.map((item) => ({
      name: item.modality,
      value: item.count,
      percentage: item.percentage,
      fill: modalityColorScale[item.modality] || "var(--color-primary)",
    }));
  }, [overview]);

  const modalityTotalCount = useMemo(() => {
    return modalityPieData.reduce((sum, entry) => sum + entry.value, 0);
  }, [modalityPieData]);

  const topModality = useMemo(() => {
    if (!overview || overview.modalities.length === 0) {
      return null;
    }
    return overview.modalities.slice().sort((a, b) => b.count - a.count)[0];
  }, [overview]);

  const peakDay = useMemo(() => {
    if (!overview || overview.daily.length === 0) {
      return null;
    }
    return overview.daily.reduce((acc, entry) =>
      entry.total > (acc?.total || -Infinity) ? entry : acc
    );
  }, [overview]);

  const insightHighlights = useMemo(() => {
    if (!overview) {
      return [];
    }
    const latestMomentum =
      momentumSeries[momentumSeries.length - 1] || momentumSeries[0];
    const highlights = [];
    if (topModality) {
      highlights.push(
        `${topModality.modality} is your most-used channel with ${topModality.count} entries (${topModality.percentage}%).`
      );
    }
    if (peakDay) {
      const dateLabel = new Date(peakDay.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      highlights.push(
        `You were most active on ${dateLabel} with ${peakDay.total} logged interactions.`
      );
    }
    if (latestMomentum) {
      highlights.push(
        `Your current 3-day average sits at ${
          latestMomentum.rollingAvg || 0
        } entries per day.`
      );
    }
    return highlights;
  }, [overview, momentumSeries, peakDay, topModality]);

  const activeRangeLabel = useMemo(() => {
    const active = rangeFilters.find((option) => option.value === rangeDays);
    return active?.label ?? "Selected range";
  }, [rangeDays, rangeFilters]);

  const overlayMessageLabel = useMemo(() => {
    return (activeRangeLabel || "Selected range").toLowerCase();
  }, [activeRangeLabel]);

  const handleDecision = async (targetUserId, approve) => {
    try {
      setActionMessage("");
      await decidePendingUser({ userId: targetUserId, approve });
      setPendingUsers((prev) =>
        prev.filter((entry) => entry.id !== targetUserId)
      );
      setActionMessage(
        approve ? "User approved successfully." : "User request rejected."
      );
    } catch (error) {
      setActionMessage(error.message || "Unable to update user status.");
    }
  };

  if (isLoading) {
    return (
      <div
        className="dashboard-loading-screen"
        role="status"
        aria-live="polite"
      >
        <div className="loading-spinner" aria-hidden="true" />
        <p>Loading your insights...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="dashboard dashboard--error">
        <h2>Dashboard unavailable</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  return (
    <div className={`dashboard${isTransitioning ? " is-transitioning" : ""}`}>
      {isTransitioning ? (
        <div
          className="dashboard__loading-overlay"
          role="status"
          aria-live="polite"
        >
          <div className="loading-spinner" aria-hidden="true" />
          <p>Refreshing {overlayMessageLabel}...</p>
        </div>
      ) : null}
      <section className="dashboard__hero">
        <div className="dashboard__hero-content">
          <p className="dashboard__eyebrow">Personal insights</p>
          <h1>Welcome back, {user?.full_name?.split(" ")[0] || "friend"}</h1>
          <p>
            Every interaction—text, audio, image, or chatbot—feeds into your
            streak and behaviour charts below. Keep exploring to see richer
            context in real time.
          </p>
          <div className="dashboard__chips">
            {heroChips.map((chip) => (
              <span key={chip.label} className="dashboard-chip">
                <small>{chip.label}</small>
                <strong>{chip.value}</strong>
              </span>
            ))}
          </div>
        </div>
        <div className="dashboard__hero-metrics">
          {heroMetrics.map((metric) => (
            <article key={metric.label}>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>
      </section>
      <section className="dashboard__filters" aria-label="Time range selector">
        <div>
          <p className="dashboard__filters-label">Insights range</p>
          <span className="dashboard__filters-active">{activeRangeLabel}</span>
        </div>
        <div className="dashboard__filters-buttons" role="group">
          {rangeFilters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleRangeChange(option.value)}
              className={
                option.value === rangeDays
                  ? "dashboard-filter is-active"
                  : "dashboard-filter"
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>
      <section className="dashboard__summary">
        {summaryCards.map((card) => (
          <article key={card.label} className="summary-card">
            <div>
              <p>{card.label}</p>
              <strong>{card.value}</strong>
            </div>
            <span>{card.detail}</span>
          </article>
        ))}
      </section>
      <section className="dashboard__grid">
        <article className="dashboard__panel dashboard__panel--wide dashboard__panel--glass">
          <div className="dashboard__panel-heading">
            <h2>Daily activity trend</h2>
            <p>Modalities captured over the last two weeks.</p>
          </div>
          <div className="dashboard__chart">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={overview.daily} margin={{ left: 12, right: 12 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-subtle)"
                />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface-tooltip)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.75rem",
                    color: "var(--color-text)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="text"
                  stroke="var(--color-chart-train)"
                  strokeWidth={2}
                  dot={false}
                  name="Text"
                />
                <Line
                  type="monotone"
                  dataKey="audio"
                  stroke="var(--color-chart-loss-train)"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                  name="Audio"
                />
                <Line
                  type="monotone"
                  dataKey="image"
                  stroke="var(--color-chart-validation)"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="2 2"
                  name="Image"
                />
                <Line
                  type="monotone"
                  dataKey="chatbot"
                  stroke="var(--color-chart-loss-validation)"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="6 2"
                  name="Chatbot"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
        {emotionChartData.length ? (
          <article className="dashboard__panel dashboard__panel--wide">
            <div className="dashboard__panel-heading">
              <h2>Emotion trend</h2>
              <p>
                Track how dominant emotions shifted over the selected period.
              </p>
            </div>
            <div className="dashboard__chart">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={emotionChartData}
                  margin={{ left: 0, right: 12 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border-subtle)"
                  />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [`${value} entries`, name]}
                    contentStyle={{
                      background: "var(--color-surface-tooltip)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.75rem",
                      color: "var(--color-text)",
                    }}
                  />
                  {emotionKeys.map((emotion) => (
                    <Area
                      key={emotion}
                      type="monotone"
                      dataKey={emotion}
                      stackId="emotion"
                      stroke={
                        emotionColorMap[emotion] || "var(--color-primary)"
                      }
                      fill={emotionColorMap[emotion] || "var(--color-primary)"}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="emotion-legend">
              {emotionKeys.map((emotion) => (
                <span key={emotion} className="emotion-legend__item">
                  <span
                    className="emotion-legend__swatch"
                    style={{ backgroundColor: emotionColorMap[emotion] }}
                  />
                  {emotion}
                </span>
              ))}
            </div>
          </article>
        ) : null}

        <article className="dashboard__panel dashboard__panel--glass dashboard__panel--split">
          <div className="dashboard__panel-heading">
            <h2>Modality mix</h2>
            <p>Visual breakdown plus quick takeaways for each channel.</p>
          </div>
          <div className="modality-visual">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={modalityPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={4}
                  labelLine={false}
                >
                  {modalityPieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.fill}
                      stroke="transparent"
                    />
                  ))}
                  <Label
                    position="center"
                    content={({ viewBox }) => {
                      if (!viewBox || typeof viewBox.cx !== "number") {
                        return null;
                      }
                      const { cx, cy } = viewBox;
                      return (
                        <g>
                          <text
                            x={cx}
                            y={cy - 6}
                            textAnchor="middle"
                            fill="var(--color-text)"
                            fontSize={18}
                            fontWeight={700}
                          >
                            {modalityTotalCount}
                          </text>
                          <text
                            x={cx}
                            y={cy + 12}
                            textAnchor="middle"
                            fill="var(--color-text-light)"
                            fontSize={12}
                          >
                            total entries
                          </text>
                        </g>
                      );
                    }}
                  />
                </Pie>
                <Tooltip
                  formatter={(value, name, payload) => {
                    const percentage = payload?.payload?.percentage ?? 0;
                    return [`${value} entries (${percentage}%)`, name];
                  }}
                  contentStyle={{
                    background: "var(--color-surface-tooltip)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.75rem",
                    color: "var(--color-text)",
                  }}
                  labelStyle={{ color: "var(--color-text-light)" }}
                  itemStyle={{ color: "var(--color-text)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="modality-breakdown">
            {overview.modalities.map((item) => (
              <li key={item.modality}>
                <div className="modality-breakdown__label">
                  <span>{item.modality}</span>
                  <strong>{item.count}</strong>
                </div>
                <div className="modality-breakdown__bar">
                  <span style={{ width: `${item.percentage}%` }} />
                </div>
                <p>{item.percentage}% of recent activity</p>
              </li>
            ))}
          </ul>
          {insightHighlights.length ? (
            <ul className="insight-list">
              {insightHighlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          ) : null}
        </article>
        <article className="dashboard__panel">
          <div className="dashboard__panel-heading">
            <h2>Recent entries</h2>
            <p>The latest logs captured for your timeline.</p>
          </div>
          {overview.recent.length === 0 ? (
            <p>No entries yet. Run an analysis to populate your feed.</p>
          ) : (
            <ul className="recent-entries">
              {overview.recent.map((entry) => (
                <li key={entry.id}>
                  <div>
                    <strong>{entry.modality}</strong>
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <p>Emotion: {entry.emotion}</p>
                    {entry.notes ? <p>Note: {entry.notes}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
      {isAdmin ? (
        <section className="dashboard__panel dashboard__panel--admin">
          <div className="dashboard__panel-heading">
            <h2>Pending approvals</h2>
            <p>Approve or reject user registrations.</p>
          </div>
          {actionMessage ? (
            <div className="admin-status">{actionMessage}</div>
          ) : null}
          {pendingUsers.length === 0 ? (
            <p>All caught up. No pending users right now.</p>
          ) : (
            <table className="pending-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.full_name}</td>
                    <td>{entry.email}</td>
                    <td>{new Date(entry.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => handleDecision(entry.id, true)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline"
                        onClick={() => handleDecision(entry.id, false)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}
    </div>
  );
};

export default Dashboard;
