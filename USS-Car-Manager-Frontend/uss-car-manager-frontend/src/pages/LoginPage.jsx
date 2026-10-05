import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { apiMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(apiMessage(err, "Unable to log in"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-brand"><span className="brand-mark large">U</span><span><strong>USS Car Manager</strong><small>Fleet, money and partner control in one place.</small></span></div>
        <div className="login-copy">
          <div className="eyebrow light">Secure staff access</div>
          <h1>Run your cars with less confusion.</h1>
          <p>Track vehicles, earnings, expenses, partner settlements, reminders and reports from desktop or mobile.</p>
        </div>
        <div className="login-feature-grid">
          <div><strong>Fleet</strong><span>Status, documents & service reminders</span></div>
          <div><strong>Finance</strong><span>Earnings, expenses & partner allocations</span></div>
          <div><strong>Control</strong><span>Roles, audit history & safer edits</span></div>
        </div>
      </div>
      <div className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="mobile-login-brand"><span className="brand-mark">U</span><strong>USS Car Manager</strong></div>
          <h2>Welcome back</h2>
          <p className="muted">Use the staff account created in your backend.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="admin@example.com" required />
          </label>
          <label className="field">
            <span>Password</span>
            <div className="password-wrap">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Your password" required />
              <button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button>
            </div>
          </label>
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          <div className="login-note">Sessions expire after 8 hours. Your password is never stored in this frontend.</div>
        </form>
      </div>
    </div>
  );
}
