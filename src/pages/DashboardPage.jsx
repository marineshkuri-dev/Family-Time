import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import EventModal from '../components/EventModal';
import TaskModal from '../components/TaskModal';
import RecurrenceBadge from '../components/RecurrenceBadge';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useFamily } from '../hooks/useFamily';
import { useEvents } from '../hooks/useEvents';
import { useTasks } from '../hooks/useTasks';
import { useFamilyMembers } from '../hooks/useFamilyMembers';
import { expandInMonth, isRecurring } from '../lib/recurrence';
import './DashboardPage.css';

function fmtDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('he-IL');
}

export default function DashboardPage() {
  const { user }    = useAuth();
  const { profile, loading: profileLoading }  = useProfile();
  const { familyId }                          = useFamily();
  // Fetch ALL family events (no upcoming filter) for accurate month count + list
  const { events,  loading: eventsLoading, refetch: refetchEvents }  = useEvents({ familyId });
  const { tasks,   loading: tasksLoading, toggleComplete, applyUpsert } = useTasks({ familyId });
  const { members, loading: membersLoading }  = useFamilyMembers({ familyId });

  const [editEvent, setEditEvent] = useState(null);
  const [editTask,  setEditTask]  = useState(null);

  const firstName = (profile?.full_name ?? user?.user_metadata?.full_name ?? '')
    .trim().split(' ')[0] || 'משתמש';

  const today     = new Date();
  const todayStr  = today.toISOString().split('T')[0];
  const thisMonth = today.getMonth();
  const thisYear  = today.getFullYear();

  // Count event occurrences in the current month (handles recurring)
  const monthCount = events.reduce((count, ev) => {
    return count + expandInMonth(ev, thisYear, thisMonth).length;
  }, 0);

  const openTasks = tasks.filter((t) => !t.is_completed).length;
  const doneTasks = tasks.filter((t) =>  t.is_completed).length;

  // Upcoming = non-recurring events from today on, OR recurring events that haven't ended
  const upcomingThree = events
    .filter((ev) => {
      if (isRecurring(ev)) return !ev.recurrence_end_date || ev.recurrence_end_date >= todayStr;
      return ev.event_date >= todayStr;
    })
    .slice(0, 3);

  const pendingThree = tasks.filter((t) => !t.is_completed).slice(0, 3);

  const stat = (value, loading) => (loading ? '—' : value);

  const statCards = [
    { label: 'אירועים החודש',  value: stat(monthCount,     eventsLoading),  icon: '📅', color: 'var(--color-primary)', to: '/events'         },
    { label: 'משימות פתוחות', value: stat(openTasks,      tasksLoading),   icon: '✅', color: 'var(--color-accent)',  to: '/tasks'          },
    { label: 'בני משפחה',     value: stat(members.length, membersLoading), icon: '👨‍👩‍👧', color: '#5cb85c',              to: '/family-members' },
    { label: 'משימות שהושלמו',value: stat(doneTasks,      tasksLoading),   icon: '🏆', color: '#9b59b6',              to: '/tasks'          },
  ];

  return (
    <Layout>
      <div className="dashboard">

        {/* ── Welcome ──────────────────────────────────────────── */}
        <div className="dashboard-welcome">
          <div>
            <h1>{profileLoading ? 'שלום! 👋' : `שלום, ${firstName}! 👋`}</h1>
            <p className="text-muted">
              היום {today.toLocaleDateString('he-IL', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* ── Stat cards (clickable) ───────────────────────────── */}
        <div className="dashboard-stats grid-4">
          {statCards.map((s) => (
            <Link key={s.label} to={s.to} className="stat-card card stat-card-link">
              <span className="stat-icon" style={{ color: s.color }}>{s.icon}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </Link>
          ))}
        </div>

        {/* ── Lists ────────────────────────────────────────────── */}
        <div className="dashboard-grid">

          {/* Upcoming events */}
          <section className="card">
            <div className="dash-section-header">
              <h2 className="section-title">אירועים קרובים</h2>
              <Link to="/events" className="dash-see-all">כל האירועים ›</Link>
            </div>

            {eventsLoading && <p className="text-muted">טוען...</p>}

            {!eventsLoading && upcomingThree.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📅</span>
                <p>אין אירועים קרובים</p>
              </div>
            )}

            {!eventsLoading && upcomingThree.length > 0 && (
              <ul className="event-list">
                {upcomingThree.map((ev) => (
                  <li key={ev.id} className="event-item">
                    <span className="event-dot" />
                    <div className="event-info">
                      <span className="dash-title-row">
                        <strong>{ev.title}</strong>
                        <RecurrenceBadge type={ev.recurrence_type} />
                      </span>
                      <span className="text-muted">
                        {fmtDate(ev.event_date)}
                        {ev.event_time && ` · ${ev.event_time.slice(0, 5)}`}
                      </span>
                    </div>
                    <button
                      className="btn btn-ghost btn-xs dash-item-edit"
                      onClick={() => setEditEvent(ev)}
                    >
                      עריכה
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Pending tasks */}
          <section className="card">
            <div className="dash-section-header">
              <h2 className="section-title">משימות ממתינות</h2>
              <Link to="/tasks" className="dash-see-all">כל המשימות ›</Link>
            </div>

            {tasksLoading && <p className="text-muted">טוען...</p>}

            {!tasksLoading && pendingThree.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>אין משימות פתוחות</p>
              </div>
            )}

            {!tasksLoading && pendingThree.length > 0 && (
              <ul className="event-list">
                {pendingThree.map((task) => (
                  <li key={task.id} className="event-item">
                    <input
                      type="checkbox"
                      className="dash-task-check"
                      checked={!!task.is_completed}
                      title="סמן כהושלמה"
                      onChange={() => toggleComplete(task.id, task.is_completed)}
                    />
                    <div className="event-info">
                      <span className="dash-title-row">
                        <strong>{task.title}</strong>
                        <RecurrenceBadge type={task.recurrence_type} />
                      </span>
                      {task.due_date && (
                        <span className="text-muted">עד {fmtDate(task.due_date)}</span>
                      )}
                    </div>
                    <button
                      className="btn btn-ghost btn-xs dash-item-edit"
                      onClick={() => setEditTask(task)}
                    >
                      עריכה
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {editEvent && (
        <EventModal
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onSaved={() => { setEditEvent(null); refetchEvents(); }}
        />
      )}
      {editTask && (
        <TaskModal
          task={editTask}
          familyId={familyId}
          userId={user?.id}
          onClose={() => setEditTask(null)}
          onSaved={(upserted) => { applyUpsert(upserted); setEditTask(null); }}
        />
      )}
    </Layout>
  );
}
