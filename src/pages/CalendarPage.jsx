import Layout from '../components/Layout';
import { events, familyMembers } from '../data/dummyData';
import './CalendarPage.css';

const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const cells = buildCalendar(year, month);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === dateStr);
  };

  return (
    <Layout>
      <div className="calendar-page">
        <div className="calendar-header-row">
          <h1 className="section-title">{MONTHS_HE[month]} {year}</h1>
          <div className="calendar-legend">
            {familyMembers.map((m) => (
              <span key={m.id} className="legend-item">
                <span className="legend-dot" style={{ background: m.color }} />
                {m.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>

        <div className="calendar-grid card">
          {DAYS_HE.map((d) => (
            <div key={d} className="calendar-day-name">{d}</div>
          ))}
          {cells.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === today.getDate();
            return (
              <div key={i} className={`calendar-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}>
                {day && <span className="cell-day">{day}</span>}
                {dayEvents.map((ev) => (
                  <span key={ev.id} className="cell-event" style={{ background: ev.color }}>
                    {ev.title}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        <section className="calendar-event-list card">
          <h2 className="section-title">כל האירועים</h2>
          <ul className="event-list-full">
            {events.map((ev) => (
              <li key={ev.id} className="event-full-item">
                <span className="event-color-bar" style={{ background: ev.color }} />
                <div>
                  <strong>{ev.title}</strong>
                  <p className="text-muted">{new Date(ev.date).toLocaleDateString('he-IL')} · {ev.time} · {ev.category}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  );
}
