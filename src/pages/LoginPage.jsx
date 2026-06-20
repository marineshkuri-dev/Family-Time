import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder — will connect to Supabase auth later
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">🏠</div>
        <h1 className="auth-title">כניסה ל-Family Time</h1>
        <p className="auth-sub">ברוכים השבים! הכנסו לחשבונכם</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">אימייל</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-forgot">
            <Link to="#">שכחתי סיסמה</Link>
          </div>
          <button type="submit" className="btn btn-primary auth-submit">כניסה</button>
        </form>

        <p className="auth-switch">
          אין לך חשבון? <Link to="/register">הרשמה חינם</Link>
        </p>
      </div>
    </div>
  );
}
