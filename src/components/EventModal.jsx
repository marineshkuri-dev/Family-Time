import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './EventModal.css';

export default function EventModal({ event, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:       event.title       ?? '',
    event_date:  event.event_date  ?? '',
    event_time:  event.event_time  ? event.event_time.slice(0, 5) : '',
    location:    event.location    ?? '',
    description: event.description ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: updateError } = await supabase
      .from('events')
      .update({
        title:       form.title,
        event_date:  form.event_date,
        event_time:  form.event_time  || null,
        location:    form.location    || null,
        description: form.description || null,
      })
      .eq('id', event.id);

    if (updateError) {
      setError('שגיאה בעדכון האירוע, אנא נסו שוב');
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
