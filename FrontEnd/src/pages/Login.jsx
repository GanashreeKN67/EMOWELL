import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  {
    label: "Demo explorer",
    email: "demo@emowell.com",
    password: "DemoUser#2025",
  },
  {
    label: "Admin reviewer",
    email: "admin@emowell.com",
    password: "AdminAccess#2025",
  },
];

const loginHighlights = [
  "Multi-modal streak tracking and celebratory nudges",
  "Unified wellness timeline across chat, audio, text, and image",
  "LLM-powered assistant with context-aware prompts",
];

const responseStats = [
  { label: "Release stage", value: "Private beta" },
  { label: "Data residency", value: "Local workspace" },
  { label: "Modalities live", value: "Text | Audio | Image | Chatbot" },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await login(form);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillDemo = (account) => {
    setForm({ email: account.email, password: account.password });
  };

  return (
    <div className="auth-shell">
      <div className="auth-shell__glow" aria-hidden />
      <div className="auth-shell__grid">
        <section className="auth-panel auth-panel--form">
          <span className="auth-pill">Returning explorers</span>
          <h1>Welcome back to your EMOWELL hub</h1>
          <p className="auth-lede">
            Sign in to continue tracking mood signals, unlock advanced models,
            and sync conversations across every modality.
          </p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            {errorMessage ? (
              <div className="auth-banner auth-banner--error">
                {errorMessage}
              </div>
            ) : null}
            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in" : "Continue to dashboard"}
            </button>
          </form>
          <p className="auth-card__footnote">
            Need an account? <Link to="/register">Create one here</Link>.
          </p>
        </section>
        <aside className="auth-panel auth-panel--meta">
          <div className="auth-metric-grid">
            {responseStats.map((stat) => (
              <article key={stat.label} className="auth-metric">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
          <div className="auth-demo">
            <div>
              <h2>Demo credentials</h2>
              <p>Seeded accounts make evaluation effortless. Autofill below.</p>
            </div>
            <ul className="auth-demo__list">
              {demoAccounts.map((account) => (
                <li key={account.email}>
                  <button type="button" onClick={() => autofillDemo(account)}>
                    <span>{account.label}</span>
                    <strong>{account.email}</strong>
                  </button>
                  <code>{account.password}</code>
                </li>
              ))}
            </ul>
            <p className="auth-side-panel__hint">
              Mirrored inside <code>BackEnd/data/demo_seed.json</code> for easy
              resets.
            </p>
          </div>
          <ul className="auth-highlights">
            {loginHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Login;
