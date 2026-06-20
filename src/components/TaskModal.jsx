import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './EventModal.css';
import './TaskModal.css';

const empty = { title: '', description: '', due_date: '' };

function toForm(task) {
  if (!task) return empty;
  return {
    title:       task.title       ?? '',
    description: task.description ?? '',
    due_date:    task.due_date    ?? '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title:       form.title,
      description: form.description || null,
      due_date:    form.due_date    || null,
    };

    let result;
    if (isEdit) {
      result = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', task.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('tasks')
        .insert({ ...payload, family_id: familyId, created_by: userId, is_completed: false })
        .select()
        .single();
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
