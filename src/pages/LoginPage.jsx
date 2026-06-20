import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './AuthPages.css';

const AUTH_ERRORS = {
  'Invalid login credentials':         'אימייל או סיסמה שגויים',
  'Email not confirmed':               'יש לאמת את כתובת האימייל לפני הכניסה',
  'Too many requests':                 'יותר מדי ניסיונות, אנא המתן מספר דקות',
};
const toHebrew = (msg) => {
  for (const [key, val] of Object.entries(AUTH_ERRORS)) {
    if (msg.includes(key)) return val;
  }
  return 'אירעה שגיאה, אנא נסו שוב';
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    form.email.trim(),
      password: form.password,
    });

    if (authError) {
      setError(toHebrew(authError.message));
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">🏠</div>
        <h1 className="auth-title">כניסה ל-Family Time</h1>
        <p className="auth-sub">ברוכים השבים! הכנסו לחשבונכם</p>

        {error && <div className="auth-error">{error}</div>}

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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <div className="auth-forgot">
            <Link to="#">שכחתי סיסמה</Link>
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>

        <p className="auth-switch">
          אין לך חשבון? <Link to="/register">הרשמה חינם</Link>
        </p>
      </div>
    </div>
  );
}
