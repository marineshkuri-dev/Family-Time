import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../hooks/useFamily';
import { useEvents } from '../hooks/useEvents';
import { supabase } from '../lib/supabase';
import EventModal from '../components/EventModal';
import RecurrenceBadge from '../components/RecurrenceBadge';
import { expandInMonth } from '../lib/recurrence';
import { getHolidaysForMonth } from '../lib/jewishHolidays';
import './CalendarPage.css';

const DAYS_HE   = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function buildCalendar(year, month) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells       = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function fmtDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('he-IL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function CalendarPage() {
  const realToday = new Date();
  const { user }              = useAuth();
  const { familyId }          = useFamily();
  // Fetch all family events (all dates, no upcoming filter)
  const { events, loading, refetch } = useEvents({ familyId });

  const [viewYear,  setViewYear]  = useState(realToday.getFullYear());
  const [viewMonth, setViewMonth] = useState(realToday.getMonth());
  const [editEvent, setEditEvent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const goToPrev = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };
  const goToToday = () => { setViewYear(realToday.getFullYear()); setViewMonth(realToday.getMonth()); };

  const cells    = buildCalendar(viewYear, viewMonth);
  const holidays = useMemo(() => getHolidaysForMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  // Precompute which events fall on each day of the viewed month
  const dayToEvents = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      expandInMonth(ev, viewYear, viewMonth).forEach((day) => {
        if (!map[day]) map[day] = [];
        if (!map[day].some((e) => e.id === ev.id)) map[day].push(ev);
      });
    });
    return map;
  }, [events, viewYear, viewMonth]);

  // Events that have at least one occurrence in this view month (for the list below)
  const eventsInView = useMemo(() =>
    events.filter((ev) => expandInMonth(ev, viewYear, viewMonth).length > 0),
    [events, viewYear, viewMonth]
  );

  const isCurrentMonth = viewYear === realToday.getFullYear() && viewMonth === realToday.getMonth();

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    const { error } = await supabase
      .from('events').delete().eq('id', id).eq('created_by', user.id);
    setDeleteLoading(false);
    if (!error) { setConfirmDelete(null); refetch(); }
  };

  return (
    <Layout>
      <div className="calendar-page">

        {/* ── Navigation ───────────────────────────────────────── */}
        <div className="calendar-nav">
          <button className="btn btn-ghost btn-sm cal-nav-btn" onClick={goToPrev} aria-label="חודש קודם">
            ›
          </button>
          <div className="cal-title">
            <h1 className="section-title" style={{ margin: 0 }}>
              {MONTHS_HE[viewMonth]} {viewYear}
            </h1>
            {!isCurrentMonth && (
              <button className="btn btn-ghost btn-xs" onClick={goToToday}>
                חזרה להיום
              </button>
            )}
          </div>
          <button className="btn btn-ghost btn-sm cal-nav-btn" onClick={goToNext} aria-label="חודש הבא">
            ‹
          </button>
        </div>

        {/* ── Calendar grid ────────────────────────────────────── */}
        <div className="calendar-grid card">
          {DAYS_HE.map((d) => (
            <div key={d} className="calendar-day-name">{d}</div>
          ))}

          {cells.map((day, i) => {
            const dayEvents   = day ? (dayToEvents[day] ?? []) : [];
            const dayHolidays = day ? (holidays[day]    ?? []) : [];
            const isToday     = isCurrentMonth && day === realToday.getDate();

            return (
              <div
                key={i}
                className={[
                  'calendar-cell',
                  !day           ? 'empty'   : '',
                  isToday        ? 'today'   : '',
                  dayHolidays.length ? 'has-holiday' : '',
                ].filter(Boolean).join(' ')}
              >
                {day && <span className="cell-day">{day}</span>}

                {/* Holidays — shown first, read-only */}
                {dayHolidays.map((h, hi) => (
                  <span key={`h-${hi}`} className="cell-holiday" title={h.name}>
                    {h.icon} {h.name}
                  </span>
                ))}

                {/* Family events */}
                {dayEvents.map((ev) => (
                  <span key={`${ev.id}-${day}`} className="cell-event" title={ev.title}>
                    {ev.recurrence_type && ev.recurrence_type !== 'none' && '🔁 '}
                    {ev.title}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        {/* ── Holiday legend ──────────────────────────────────── */}
        {Object.values(holidays).some((h) => h.length > 0) && (
          <section className="holiday-legend card">
            <h2 className="section-title">חגים ומועדים</h2>
            <ul className="holiday-list">
              {Object.entries(holidays)
                .sort(([a], [b]) => Number(a) - Number(b))
                .flatMap(([day, hs]) => hs.map((h, i) => (
                  <li key={`${day}-${i}`} className="holiday-item">
                    <span className="holiday-day">{day}</span>
                    <span className="holiday-icon">{h.icon}</span>
                    <span className="holiday-name">{h.name}</span>
                  </li>
                )))
              }
            </ul>
          </section>
        )}

        {/* ── Event list for this month ────────────────────────── */}
        <section className="calendar-event-list card">
          <h2 className="section-title">אירועי {MONTHS_HE[viewMonth]}</h2>

          {loading && <p className="text-muted">טוען אירועים...</p>}

          {!loading && eventsInView.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📅</span>
              <p>אין אירועים בחודש זה</p>
            </div>
          )}

          {!loading && eventsInView.length > 0 && (
            <ul className="event-list-full">
              {eventsInView.map((ev) => (
                <li key={ev.id} className="event-full-item">
                  <span className="event-color-bar" />
                  <div className="event-full-info">
                    <div className="event-title-row">
                      <strong>{ev.title}</strong>
                      <RecurrenceBadge type={ev.recurrence_type} />
                    </div>
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
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {editEvent && (
        <EventModal event={editEvent} onClose={() => setEditEvent(null)} onSaved={refetch} />
      )}
    </Layout>
  );
}
