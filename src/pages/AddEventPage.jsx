import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import RecurrencePicker from '../components/RecurrencePicker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useFamily } from '../hooks/useFamily';
import './AddEventPage.css';

const CATEGORIES = ['משפחה', 'חינוך', 'ספורט', 'פנאי', 'עבודה', 'בריאות', 'אחר'];

const emptyForm = {
  title: '', event_date: '', event_time: '', category: '', location: '', description: '',
  recurrence_type: 'none', recurrence_days: [], recurrence_end_date: '',
};

function deriveFamilyName(user) {
  const parts    = (user?.user_metadata?.full_name ?? '').trim().split(' ').filter(Boolean);
  const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0] ?? '';
  return lastName ? `משפחת ${lastName}` : 'המשפחה שלי';
}

export default function AddEventPage() {
  const navigate           = useNavigate();
  const { user }           = useAuth();
  const { profile }        = useProfile();
  const { familyId, loading: familyLoading, error: familyError, retry: retryFamily } = useFamily();

  const [form, setForm]       = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRecurrence = (rec) => setForm({ ...form, ...rec });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('[AddEventPage] submit start');
    console.log('[AddEventPage] user.id   :', user?.id ?? 'null');
    console.log('[AddEventPage] profile   :', profile);
    console.log('[AddEventPage] familyId  :', familyId ?? 'null (will call RPC)');

    let resolvedFamilyId = familyId;

    if (!resolvedFamilyId) {
      const name = deriveFamilyName(user);
      console.log('[AddEventPage] familyId missing — calling create_family_for_user RPC:', name);
      const { data: rpcId, error: rpcErr } = await supabase
        .rpc('create_family_for_user', { family_name: name });
      console.log('[AddEventPage] RPC response →', { rpcId, error: rpcErr?.message ?? null });

      if (rpcErr || !rpcId) {
        const msg = rpcErr?.message ?? 'create_family_for_user returned no data';
        setError(msg);
        setLoading(false);
        return;
      }
      resolvedFamilyId = rpcId;
    }

    const payload = {
      title:               form.title,
      description:         form.description         || null,
      event_date:          form.event_date,
      event_time:          form.event_time           || null,
      location:            form.location             || null,
      created_by:          user.id,
      family_id:           resolvedFamilyId,
      family_member_id:    null,
      recurrence_type:     form.recurrence_type      || 'none',
      recurrence_days:     form.recurrence_days.length ? form.recurrence_days : null,
      recurrence_end_date: form.recurrence_end_date  || null,
    };

    console.log('[AddEventPage] INSERT payload →', payload);

    const { data: insertData, error: insertError } = await supabase
      .from('events').insert(payload).select().single();

    console.log('[AddEventPage] INSERT response →', { data: insertData, error: insertError?.message ?? null });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    navigate('/calendar');
  };

  const isDisabled = loading || familyLoading || !!familyError;

  if (!familyLoading && familyError) {
    return (
      <Layout>
        <div className="add-event-page">
          <h1 className="section-title">הוספת אירוע חדש</h1>
          <div className="card family-error-card">
            <p className="text-danger" style={{ marginBottom: '1rem' }}>לא ניתן לטעון את נתוני המשפחה.</p>
            <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>{familyError}</p>
            <button className="btn btn-primary" onClick={retryFamily}>נסה שוב</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="add-event-page">
        <h1 className="section-title">הוספת אירוע חדש</h1>

        <div className="add-event-card card">
          {familyLoading && <div className="family-loading-banner">טוען נתוני משפחה...</div>}
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="add-event-form">
            <div className="form-group">
              <label htmlFor="title">שם האירוע *</label>
              <input
                id="title" name="title" type="text"
                className="input" placeholder="למשל: ארוחת ערב משפחתית"
                value={form.title} onChange={handleChange}
                required disabled={isDisabled}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="event_date">תאריך *</label>
                <input
                  id="event_date" name="event_date" type="date"
                  className="input" value={form.event_date}
                  onChange={handleChange} required disabled={isDisabled}
                />
              </div>
              <div className="form-group">
                <label htmlFor="event_time">שעה</label>
                <input
                  id="event_time" name="event_time" type="time"
                  className="input" value={form.event_time}
                  onChange={handleChange} disabled={isDisabled}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">קטגוריה</label>
                <select
                  id="category" name="category"
                  className="input" value={form.category}
                  onChange={handleChange} disabled={isDisabled}
                >
                  <option value="">בחר קטגוריה</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="location">מיקום</label>
                <input
                  id="location" name="location" type="text"
                  className="input" placeholder="כתובת או שם מקום"
                  value={form.location} onChange={handleChange}
                  disabled={isDisabled}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">תיאור</label>
              <textarea
                id="description" name="description"
                className="input" rows={3}
                placeholder="פרטים נוספים על האירוע..."
                value={form.description} onChange={handleChange}
                disabled={isDisabled}
              />
            </div>

            {/* ── Recurrence ───────────────────────────────────────── */}
            <div className="form-divider" />
            <RecurrencePicker
              value={{
                recurrence_type:     form.recurrence_type,
                recurrence_days:     form.recurrence_days,
                recurrence_end_date: form.recurrence_end_date,
              }}
              onChange={handleRecurrence}
              disabled={isDisabled}
            />

            <div className="add-event-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)} disabled={isDisabled}>
                ביטול
              </button>
              <button type="submit" className="btn btn-primary" disabled={isDisabled}>
                {familyLoading ? 'טוען משפחה...' : loading ? 'שומר...' : 'שמור אירוע'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
