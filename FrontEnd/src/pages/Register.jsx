import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const approvalSteps = [
  "Submit your profile so admins can verify legitimate usage.",
  "Receive an approval email—most decisions land within the hour.",
  "Sync all modalities and start logging data instantly.",
];

const quickFacts = [
  { label: "Access scope", value: "Internal collaborators" },
  { label: "Review method", value: "Manual admin check" },
  { label: "Stack", value: "FastAPI + React" },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");
    try {
      await register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
      });
      setStatusMessage(
        "Registration submitted. We'll send an email once an admin approves your account."
      );
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setErrorMessage(error.message || "Unable to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-shell__glow" aria-hidden />
      <div className="auth-shell__grid">
        <section className="auth-panel auth-panel--form">
          <span className="auth-pill auth-pill--accent">New to EMOWELL?</span>
          <h1>Create your account</h1>
          <p className="auth-lede">
            We review new registrations quickly so you can explore the chatbot,
            dashboards, and modality experiments with confidence.
          </p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="full_name">Full name</label>
            <input
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
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
              minLength={8}
              required
            />
            {errorMessage ? (
              <div className="auth-banner auth-banner--error">
                {errorMessage}
              </div>
            ) : null}
            {statusMessage ? (
              <div className="auth-banner auth-banner--success">
                {statusMessage}
              </div>
            ) : null}
            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting" : "Submit for approval"}
            </button>
          </form>
          <p className="auth-card__footnote">
            Already approved? <Link to="/login">Log in here</Link>.
          </p>
        </section>
        <aside className="auth-panel auth-panel--meta">
          <div className="auth-metric-grid">
            {quickFacts.map((fact) => (
              <article key={fact.label} className="auth-metric">
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
              </article>
            ))}
          </div>
          <div className="auth-demo">
            <div>
              <h2>Approval flow</h2>
              <p>Transparent checkpoints so you know what happens next.</p>
            </div>
            <ol className="auth-steps">
              {approvalSteps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <p>
              Tip: use <strong>demo@emowell.com</strong> while you wait for
              approval.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Register;
