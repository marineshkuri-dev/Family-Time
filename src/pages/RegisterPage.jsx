import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

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
        <h1 className="auth-title">הרשמה ל-Family Time</h1>
        <p className="auth-sub">צרו חשבון משפחתי חינמי תוך שניות</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">שם מלא</label>
            <input id="name" name="name" type="text" className="input" placeholder="ישראל ישראלי" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">אימייל</label>
            <input id="email" name="email" type="email" className="input" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input id="password" name="password" type="password" className="input" placeholder="לפחות 6 תווים" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">אימות סיסמה</label>
            <input id="confirm" name="confirm" type="password" className="input" placeholder="חזרה על הסיסמה" value={form.confirm} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary auth-submit">יצירת חשבון</button>
        </form>

        <p className="auth-switch">
          כבר יש לך חשבון? <Link to="/login">כניסה</Link>
        </p>
      </div>
    </div>
  );
}
