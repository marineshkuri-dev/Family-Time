import { useState } from 'react';
import Layout from '../components/Layout';
import { currentUser, tasks, events } from '../data/dummyData';
import './ProfilePage.css';

export default function ProfilePage() {
  const [form, setForm] = useState({ name: currentUser.name, email: currentUser.email });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setSaved(false); };
  const handleSubmit = (e) => { e.preventDefault(); setSaved(true); };

  const initials = currentUser.name.split(' ').map(w => w[0]).join('');

  return (
    <Layout>
      <div className="profile-page">
        <h1 className="section-title">הפרופיל שלי</h1>

        <div className="profile-layout">
          <div className="profile-sidebar card">
            <div className="avatar avatar-xl profile-avatar">{initials}</div>
            <h2>{currentUser.name}</h2>
            <p className="text-muted">{currentUser.email}</p>
            <span className="badge badge-primary">{currentUser.role === 'admin' ? 'מנהל משפחה' : 'בן משפחה'}</span>

            <div className="divider" />

            <div className="profile-quick-stats">
              <div className="pqs-item">
                <strong>{events.length}</strong>
                <span>אירועים</span>
              </div>
              <div className="pqs-item">
                <strong>{tasks.length}</strong>
                <span>משימות</span>
              </div>
            </div>
          </div>

          <div className="profile-main">
            <div className="card">
              <h2 className="section-title" style={{ fontSize: 'var(--font-size-lg)' }}>עריכת פרטים</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">שם מלא</label>
                  <input id="name" name="name" type="text" className="input" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="email">אימייל</label>
                  <input id="email" name="email" type="email" className="input" value={form.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="pw">שינוי סיסמה</label>
                  <input id="pw" name="pw" type="password" className="input" placeholder="השאר ריק אם לא משנה" />
                </div>
                <div className="profile-form-footer">
                  <button type="submit" className="btn btn-primary">שמור שינויים</button>
                  {saved && <span className="save-success">✓ הפרטים נשמרו בהצלחה</span>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
