import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useFamily } from '../hooks/useFamily';
import { useEvents } from '../hooks/useEvents';
import { useTasks } from '../hooks/useTasks';
import './ProfilePage.css';

function getInitials(name, email) {
  if (name) return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  if (email) return email[0].toUpperCase();
  return 'מ';
}

const emptyPw = { current: '', next: '', confirm: '' };

export default function ProfilePage() {
  const { user }                                   = useAuth();
  const { profile, loading, error, updateProfile } = useProfile();
  const { familyId }                               = useFamily();
  const { events }                                 = useEvents();
  const { tasks }                                  = useTasks({ familyId });

  // ── Profile form ───────────────────────────────────────────────
  const [form, setForm]           = useState({ full_name: '' });
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name ?? '' });
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
    setSaveError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    const { error: err } = await updateProfile({ full_name: form.full_name });
    setSaving(false);
    if (err) setSaveError(err);
    else setSaved(true);
  };

  // ── Password form ──────────────────────────────────────────────
  const [pwForm, setPwForm]       = useState(emptyPw);
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwError, setPwError]     = useState('');
  const [pwSaved, setPwSaved]     = useState(false);

  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
    setPwError('');
    setPwSaved(false);
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSaved(false);

    // ── Client-side validation ─────────────────────────────────
    if (!pwForm.current) {
      return setPwError('נא להזין את הסיסמה הנוכחית');
    }
    if (pwForm.next.length < 6) {
      return setPwError('הסיסמה החדשה חייבת להכיל לפחות 6 תווים');
    }
    if (pwForm.next !== pwForm.confirm) {
      return setPwError('הסיסמאות החדשות אינן תואמות');
    }
    if (pwForm.next === pwForm.current) {
      return setPwError('הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית');
    }

    setPwSaving(true);

    // ── Step 1: verify current password by re-authenticating ───
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email:    user.email,
      password: pwForm.current,
    });

    if (authErr) {
      setPwError('הסיסמה הנוכחית שגויה');
      setPwSaving(false);
      return;
    }

    // ── Step 2: update to new password ─────────────────────────
    const { error: updateErr } = await supabase.auth.updateUser({
      password: pwForm.next,
    });

    setPwSaving(false);

    if (updateErr) {
      setPwError(updateErr.message);
      return;
    }

    setPwForm(emptyPw);
    setPwSaved(true);
  };

  // ── Render ─────────────────────────────────────────────────────
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

          {/* ── Right column: two cards stacked ──────────────── */}
          <div className="profile-main">

            {/* Card 1: edit name */}
            <div className="card">
              <h2 className="profile-card-title">עריכת פרטים</h2>

              {saveError && <div className="auth-error">{saveError}</div>}

              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label htmlFor="full_name">שם מלא</label>
                  <input
                    id="full_name" name="full_name" type="text"
                    className="input" placeholder="השם שלך"
                    value={form.full_name} onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="p-email">אימייל</label>
                  <input
                    id="p-email" name="email" type="email"
                    className="input profile-email-readonly"
                    value={email} readOnly
                  />
                  <small className="text-muted">לא ניתן לשנות את האימייל</small>
                </div>

                <div className="profile-form-footer">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'שומר...' : 'שמור שינויים'}
                  </button>
                  {saved && <span className="save-success">✓ הפרטים נשמרו בהצלחה</span>}
                </div>
              </form>
            </div>

            {/* Card 2: change password */}
            <div className="card">
              <h2 className="profile-card-title">שינוי סיסמה</h2>

              {pwError  && <div className="auth-error">{pwError}</div>}
              {pwSaved  && (
                <div className="pw-success">✓ סיסמה עודכנה בהצלחה</div>
              )}

              <form onSubmit={handlePwSubmit} autoComplete="off">
                <div className="form-group">
                  <label htmlFor="pw-current">סיסמה נוכחית</label>
                  <input
                    id="pw-current" name="current" type="password"
                    className="input" placeholder="הסיסמה הנוכחית שלך"
                    value={pwForm.current} onChange={handlePwChange}
                    disabled={pwSaving} autoComplete="current-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pw-next">סיסמה חדשה</label>
                  <input
                    id="pw-next" name="next" type="password"
                    className="input" placeholder="לפחות 6 תווים"
                    value={pwForm.next} onChange={handlePwChange}
                    disabled={pwSaving} autoComplete="new-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pw-confirm">אישור סיסמה חדשה</label>
                  <input
                    id="pw-confirm" name="confirm" type="password"
                    className="input" placeholder="הזן שוב את הסיסמה החדשה"
                    value={pwForm.confirm} onChange={handlePwChange}
                    disabled={pwSaving} autoComplete="new-password"
                  />
                  {/* Live match indicator */}
                  {pwForm.next && pwForm.confirm && (
                    <small className={pwForm.next === pwForm.confirm ? 'pw-match' : 'pw-mismatch'}>
                      {pwForm.next === pwForm.confirm ? '✓ הסיסמאות תואמות' : '✗ הסיסמאות אינן תואמות'}
                    </small>
                  )}
                </div>

                <div className="profile-form-footer">
                  <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                    {pwSaving ? 'מעדכן...' : 'עדכן סיסמה'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
