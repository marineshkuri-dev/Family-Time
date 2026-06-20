import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../hooks/useEvents';
import { supabase } from '../lib/supabase';
import EventModal from '../components/EventModal';
import './CalendarPage.css';

const DAYS_HE   = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function buildCalendar(year, month) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function fmtDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('he-IL');
}

export default function CalendarPage() {
  const today  = new Date();
  const year   = today.getFullYear();
  const month  = today.getMonth();
  const cells  = buildCalendar(year, month);

  const { user }                          = useAuth();
  const { events, loading, refetch }      = useEvents();
  const [editEvent, setEditEvent]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.event_date === dateStr);
  };

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id);
    setDeleteLoading(false);
    if (!error) {
      setConfirmDelete(null);
      refetch();
    }
  };

  return (
    <Layout>
      <div className="calendar-page">
        <h1 className="section-title">{MONTHS_HE[month]} {year}</h1>

        {/* Monthly grid */}
        <div className="calendar-grid card">
          {DAYS_HE.map((d) => (
            <div key={d} className="calendar-day-name">{d}</div>
          ))}
          {cells.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const isToday   = day === today.getDate();
            return (
              <div
                key={i}
                className={`calendar-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}
              >
                {day && <span className="cell-day">{day}</span>}
                {dayEvents.map((ev) => (
                  <span key={ev.id} className="cell-event">
                    {ev.title}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        {/* Event list */}
        <section className="calendar-event-list card">
          <h2 className="section-title">כל האירועים</h2>

          {loading && <p className="text-muted">טוען אירועים...</p>}

          {!loading && events.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📅</span>
              <p>אין אירועים בלוח השנה</p>
            </div>
          )}

          {!loading && events.length > 0 && (
            <ul className="event-list-full">
              {events.map((ev) => (
                <li key={ev.id} className="event-full-item">
                  <span className="event-color-bar" />
                  <div className="event-full-info">
                    <strong>{ev.title}</strong>
                    <p className="text-muted">
                      {fmtDate(ev.event_date)}
                      {ev.event_time && ` · ${ev.event_time.slice(0, 5)}`}
                      {ev.location   && ` · ${ev.location}`}
                    </p>
                    {ev.description && (
                      <p className="event-description">{ev.description}</p>
                    )}
                  </div>

                  <div className="event-actions">
                    {confirmDelete === ev.id ? (
                      <>
                        <span className="confirm-text">למחוק?</span>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => setConfirmDelete(null)}
                          disabled={deleteLoading}
                        >
                          ביטול
                        </button>
                        <button
                          className="btn btn-danger btn-xs"
                          onClick={() => handleDelete(ev.id)}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? '...' : 'מחק'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => { setConfirmDelete(null); setEditEvent(ev); }}
                        >
                          עריכה
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-danger"
                          onClick={() => { setEditEvent(null); setConfirmDelete(ev.id); }}
                        >
                          מחיקה
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {editEvent && (
        <EventModal
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onSaved={refetch}
        />
      )}
    </Layout>
  );
}
