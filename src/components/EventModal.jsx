import { useState } from 'react';
import { supabase } from '../lib/supabase';
import RecurrencePicker from './RecurrencePicker';
import './EventModal.css';

export default function EventModal({ event, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:               event.title               ?? '',
    event_date:          event.event_date           ?? '',
    event_time:          event.event_time  ? event.event_time.slice(0, 5) : '',
    location:            event.location             ?? '',
    description:         event.description          ?? '',
    recurrence_type:     event.recurrence_type      ?? 'none',
    recurrence_days:     event.recurrence_days      ?? [],
    recurrence_end_date: event.recurrence_end_date  ?? '',
  });
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

    const { error: updateError } = await supabase
      .from('events')
      .update({
        title:               form.title,
        event_date:          form.event_date,
        event_time:          form.event_time           || null,
        location:            form.location             || null,
        description:         form.description          || null,
        recurrence_type:     form.recurrence_type      || 'none',
        recurrence_days:     form.recurrence_days.length ? form.recurrence_days : null,
        recurrence_end_date: form.recurrence_end_date  || null,
      })
      .eq('id', event.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">עריכת אירוע</h2>
          <button className="modal-close" onClick={onClose} aria-label="סגור">✕</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="m-title">שם האירוע *</label>
            <input
              id="m-title" name="title" type="text"
              className="input" value={form.title}
              onChange={handleChange} required disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="m-date">תאריך *</label>
              <input
                id="m-date" name="event_date" type="date"
                className="input" value={form.event_date}
                onChange={handleChange} required disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="m-time">שעה</label>
              <input
                id="m-time" name="event_time" type="time"
                className="input" value={form.event_time}
                onChange={handleChange} disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="m-location">מיקום</label>
            <input
              id="m-location" name="location" type="text"
              className="input" placeholder="כתובת או שם מקום"
              value={form.location} onChange={handleChange} disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="m-description">תיאור</label>
            <textarea
              id="m-description" name="description"
              className="input" rows={3}
              value={form.description} onChange={handleChange} disabled={loading}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1.5px solid var(--color-border)', margin: '4px 0' }} />

          <RecurrencePicker
            value={{
              recurrence_type:     form.recurrence_type,
              recurrence_days:     form.recurrence_days,
              recurrence_end_date: form.recurrence_end_date,
            }}
            onChange={handleRecurrence}
            disabled={loading}
          />

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              ביטול
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
