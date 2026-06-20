import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './EventModal.css';
import './FamilyMemberModal.css';

const ROLE_SUGGESTIONS = ['אב', 'אם', 'ילד', 'ילדה', 'סב', 'סבתא', 'אח', 'אחות', 'חבר משפחה'];

function toForm(member) {
  if (!member) return { full_name: '', role: '' };
  return {
    // display_name is the profile-enriched fallback computed in the hook
    full_name: member.full_name ?? member.display_name ?? '',
    role:      member.role      ?? '',
  };
}

export default function FamilyMemberModal({ member = null, familyId, onClose, onSaved }) {
  const isEdit = member !== null;
  const [form, setForm]       = useState(() => toForm(member));
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
      full_name: form.full_name.trim() || null,
      role:      form.role.trim()      || 'חבר משפחה',
    };

    let result;
    if (isEdit) {
      result = await supabase
        .from('family_members')
        .update(payload)
        .eq('id', member.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('family_members')
        .insert({ ...payload, family_id: familyId, user_id: null })
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
          <h2 className="modal-title">
            {isEdit ? 'עריכת בן משפחה' : 'הוספת בן משפחה'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="סגור">✕</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="fm-name">שם מלא *</label>
            <input
              id="fm-name" name="full_name" type="text"
              className="input" placeholder="למשל: יוסי כהן"
              value={form.full_name} onChange={handleChange}
              required disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fm-role">תפקיד במשפחה</label>
            <input
              id="fm-role" name="role" type="text"
              list="fm-role-list" className="input"
              placeholder="בחר או הקלד תפקיד..."
              value={form.role} onChange={handleChange}
              disabled={loading}
            />
            <datalist id="fm-role-list">
              {ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
            </datalist>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              ביטול
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'שומר...' : isEdit ? 'שמור שינויים' : 'הוסף'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
