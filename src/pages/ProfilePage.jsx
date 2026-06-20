import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useFamily } from '../hooks/useFamily';
import { useEvents } from '../hooks/useEvents';
import { useTasks } from '../hooks/useTasks';
import './ProfilePage.css';

function getInitials(name, email) {
  if (name) {
    return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return 'מ';
}

export default function ProfilePage() {
  const { user }                                      = useAuth();
  const { profile, loading, error, updateProfile }    = useProfile();
  const { familyId }                                  = useFamily();
  const { events }                                    = useEvents();
  const { tasks }                                     = useTasks({ familyId });

  const [form, setForm]         = useState({ full_name: '' });
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved]       = useState(false);

  // Populate form when profile data arrives
  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name ?? '' });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
    setSaveError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    const { error: saveErr } = await updateProfile({ full_name: form.full_name });
    setSaving(false);
    if (saveErr) {
      setSaveError(saveErr);
    } else {
      setSaved(true);
    }
  };

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? '';
  const email       = profile?.email     ?? user?.email ?? '';

  if (loading) {
    return (
      <Layout>
        <div className="empty-state" style={{ marginTop: '4rem' }}>
          <p className="text-muted">טוען פרופיל...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-page">
        <h1 className="section-title">הפרופיל שלי</h1>

        {error && <div className="auth-error">{error}</div>}

        <div className="profile-layout">

          {/* ── Sidebar ───────────────────────────────────────── */}
          <div className="profile-sidebar card">
            <div className="avatar avatar-xl profile-avatar">
              {getInitials(displayName, email)}
            </div>
            <h2>{displayName || 'משתמש'}</h2>
            <p className="text-muted">{email}</p>

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

          {/* ── Edit form ─────────────────────────────────────── */}
          <div className="profile-main">
            <div className="card">
              <h2 className="section-title" style={{ fontSize: 'var(--font-size-lg)' }}>
                עריכת פרטים
              </h2>

              {saveError && <div className="auth-error">{saveError}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="full_name">שם מלא</label>
                  <input
                    id="full_name" name="full_name" type="text"
                    className="input"
                    placeholder="השם שלך"
                    value={form.full_name}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="p-email">אימייל</label>
                  <input
                    id="p-email" name="email" type="email"
                    className="input profile-email-readonly"
                    value={email}
                    readOnly
                  />
                  <small className="text-muted">לא ניתן לשנות את האימייל</small>
                </div>

                <div className="form-group">
                  <label htmlFor="pw">שינוי סיסמה</label>
                  <input
                    id="pw" name="pw" type="password"
                    className="input"
                    placeholder="לא זמין כרגע"
                    disabled
                  />
                </div>

                <div className="profile-form-footer">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'שומר...' : 'שמור שינויים'}
                  </button>
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
