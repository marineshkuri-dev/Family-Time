import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import EventModal from '../components/EventModal';
import RecurrenceBadge from '../components/RecurrenceBadge';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../hooks/useFamily';
import { useEvents } from '../hooks/useEvents';
import { supabase } from '../lib/supabase';
import './EventsPage.css';

function fmtDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('he-IL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function EventsPage() {
  const navigate             = useNavigate();
  const { user }             = useAuth();
  const { familyId }         = useFamily();
  const { events, loading, error, refetch } = useEvents({ familyId });

  const [editEvent, setEditEvent]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    const { error: deleteErr } = await supabase
      .from('events').delete().eq('id', id).eq('created_by', user.id);
    setDeleteLoading(false);
    if (!deleteErr) { setConfirmDelete(null); refetch(); }
  };

  // Group events by month for a cleaner list
  const grouped = events.reduce((acc, ev) => {
    const d   = new Date(ev.event_date + 'T12:00:00');
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!acc[key]) acc[key] = { label: d.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' }), items: [] };
    acc[key].items.push(ev);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="events-page">
        <div className="events-header">
          <h1 className="section-title">כל האירועים</h1>
          <button className="btn btn-primary" onClick={() => navigate('/add-event')}>
            + אירוע חדש
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {loading && <div className="empty-state"><p className="text-muted">טוען אירועים...</p></div>}

        {!loading && events.length === 0 && (
          <div className="empty-state card">
            <span className="empty-icon">📅</span>
            <p>אין אירועים עדיין</p>
            <button className="btn btn-primary" onClick={() => navigate('/add-event')}>
              הוסף אירוע ראשון
            </button>
          </div>
        )}

        {!loading && Object.values(grouped).map((group) => (
          <section key={group.label} className="events-group">
            <h2 className="events-month-label">{group.label}</h2>
            <div className="card events-list">
              {group.items.map((ev) => (
                <div key={ev.id} className="event-full-item">
                  <span className="event-color-bar" />

                  <div className="event-full-info">
                    <div className="event-title-row">
                      <strong>{ev.title}</strong>
                      <RecurrenceBadge type={ev.recurrence_type} />
                    </div>
                    <p className="text-muted">{fmtDate(ev.event_date)}
                      {ev.event_time  && ` · ${ev.event_time.slice(0, 5)}`}
                      {ev.location    && ` · ${ev.location}`}
                    </p>
                    {ev.category    && <span className="badge badge-primary">{ev.category}</span>}
                    {ev.description && <p className="event-description">{ev.description}</p>}
                  </div>

                  <div className="event-actions">
                    {confirmDelete === ev.id ? (
                      <>
                        <span className="confirm-text">למחוק?</span>
                        <button className="btn btn-ghost btn-xs" onClick={() => setConfirmDelete(null)} disabled={deleteLoading}>
                          ביטול
                        </button>
                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(ev.id)} disabled={deleteLoading}>
                          {deleteLoading ? '...' : 'מחק'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-ghost btn-xs" onClick={() => { setConfirmDelete(null); setEditEvent(ev); }}>
                          עריכה
                        </button>
                        <button className="btn btn-ghost btn-xs text-danger" onClick={() => { setEditEvent(null); setConfirmDelete(ev.id); }}>
                          מחיקה
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {editEvent && (
        <EventModal event={editEvent} onClose={() => setEditEvent(null)} onSaved={refetch} />
      )}
    </Layout>
  );
}
