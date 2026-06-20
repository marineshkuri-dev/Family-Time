import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { categories, familyMembers } from '../data/dummyData';
import './AddEventPage.css';

const emptyForm = { title: '', date: '', time: '', category: '', memberId: '', notes: '' };

export default function AddEventPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder — will save to Supabase later
    navigate('/calendar');
  };

  return (
    <Layout>
      <div className="add-event-page">
        <h1 className="section-title">הוספת אירוע חדש</h1>

        <div className="add-event-card card">
          <form onSubmit={handleSubmit} className="add-event-form">
            <div className="form-group">
              <label htmlFor="title">שם האירוע *</label>
              <input id="title" name="title" type="text" className="input" placeholder="למשל: ארוחת ערב משפחתית" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">תאריך *</label>
                <input id="date" name="date" type="date" className="input" value={form.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="time">שעה</label>
                <input id="time" name="time" type="time" className="input" value={form.time} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">קטגוריה</label>
                <select id="category" name="category" className="input" value={form.category} onChange={handleChange}>
                  <option value="">בחר קטגוריה</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="memberId">שייך ל</label>
                <select id="memberId" name="memberId" className="input" value={form.memberId} onChange={handleChange}>
                  <option value="">בחר בן משפחה</option>
                  {familyMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">הערות</label>
              <textarea id="notes" name="notes" className="input" rows={3} placeholder="פרטים נוספים..." value={form.notes} onChange={handleChange} />
            </div>

            <div className="add-event-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>ביטול</button>
              <button type="submit" className="btn btn-primary">שמור אירוע</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
