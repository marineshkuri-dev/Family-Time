import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './AuthPages.css';

const AUTH_ERRORS = {
  'User already registered':                     'כתובת האימייל כבר רשומה במערכת',
  'Password should be at least 6 characters':    'הסיסמה חייבת להכיל לפחות 6 תווים',
  'Unable to validate email address':            'כתובת אימייל לא תקינה',
  'Too many requests':                           'יותר מדי ניסיונות, אנא המתן מספר דקות',
};
const toHebrew = (msg) => {
  for (const [key, val] of Object.entries(AUTH_ERRORS)) {
    if (msg.includes(key)) return val;
  }
  return 'אירעה שגיאה, אנא נסו שוב';
};

export default function RegisterPage() {
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      setError('הסיסמאות אינן תואמות');
      return;
    }
    if (form.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signUp({
      email:    form.email.trim(),
      password: form.password,
      options:  { data: { full_name: form.name.trim() } },
    });

    if (authError) {
      setError(toHebrew(authError.message));
      setLoading(false);
      return;
    }

    // Create profile row — best-effort, wrapped in try/catch
    if (data.user) {
      try {
        await supabase.from('profiles').upsert({
          id:        data.user.id,
          full_name: form.name.trim(),
          email:     form.email.trim(),
        });
      } catch (_) {
        // Profile insert is non-critical; auth succeeded
      }
    }

    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">🏠</div>
        <h1 className="auth-title">הרשמה ל-Family Time</h1>
        <p className="auth-sub">צרו חשבון משפחתי חינמי תוך שניות</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">שם מלא</label>
            <input
              id="name" name="name" type="text"
              className="input" placeholder="ישראל ישראלי"
              value={form.name} onChange={handleChange}
              required disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">אימייל</label>
            <input
              id="email" name="email" type="email"
              className="input" placeholder="your@email.com"
              value={form.email} onChange={handleChange}
              required disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input
              id="password" name="password" type="password"
              className="input" placeholder="לפחות 6 תווים"
              value={form.password} onChange={handleChange}
              required disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">אימות סיסמה</label>
            <input
              id="confirm" name="confirm" type="password"
              className="input" placeholder="חזרה על הסיסמה"
              value={form.confirm} onChange={handleChange}
              required disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'יוצר חשבון...' : 'יצירת חשבון'}
          </button>
        </form>

        <p className="auth-switch">
          כבר יש לך חשבון? <Link to="/login">כניסה</Link>
        </p>
      </div>
    </div>
  );
}
