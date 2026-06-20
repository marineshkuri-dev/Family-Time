import { useState } from 'react';
import { supabase } from '../lib/supabase';
import RecurrencePicker from './RecurrencePicker';
import './EventModal.css';
import './TaskModal.css';

function toForm(task) {
  if (!task) return {
    title: '', description: '', due_date: '',
    recurrence_type: 'none', recurrence_days: [], recurrence_end_date: '',
  };
  return {
    title:               task.title               ?? '',
    description:         task.description         ?? '',
    due_date:            task.due_date             ?? '',
    recurrence_type:     task.recurrence_type      ?? 'none',
    recurrence_days:     task.recurrence_days      ?? [],
    recurrence_end_date: task.recurrence_end_date  ?? '',
  };
}

export default function TaskModal({ task = null, familyId, userId, onClose, onSaved }) {
  const isEdit = task !== null;
  const [form, setForm]       = useState(() => toForm(task));
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

    const payload = {
      title:               form.title,
      description:         form.description          || null,
      due_date:            form.due_date              || null,
      recurrence_type:     form.recurrence_type       || 'none',
      recurrence_days:     form.recurrence_days.length ? form.recurrence_days : null,
      recurrence_end_date: form.recurrence_end_date   || null,
    };

    let result;
    if (isEdit) {
      result = await supabase
        .from('tasks').update(payload).eq('id', task.id).select().single();
    } else {
      result = await supabase
        .from('tasks')
        .insert({ ...payload, family_id: familyId, created_by: userId, is_completed: false })
        .select().single();
    }

    const { data, error: dbErr } = result;

    if (dbErr) {
      setError(dbErr.message);
      setLoading(false);
      return;
    }

    onSaved(data);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'עריכת משימה' : 'הוספת משימה חדשה'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="סגור">✕</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="t-title">כותרת המשימה *</label>
            <input
              id="t-title" name="title" type="text"
              className="input" placeholder="למשל: קניות לסופר"
              value={form.title} onChange={handleChange}
              required disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="t-desc">תיאור</label>
            <textarea
              id="t-desc" name="description"
              className="input" rows={3}
              placeholder="פרטים נוספים..."
              value={form.description} onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="t-due">תאריך יעד</label>
            <input
              id="t-due" name="due_date" type="date"
              className="input" value={form.due_date}
              onChange={handleChange} disabled={loading}
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
              {loading ? 'שומר...' : isEdit ? 'שמור שינויים' : 'הוסף משימה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
