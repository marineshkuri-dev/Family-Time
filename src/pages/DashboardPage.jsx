import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useFamily } from '../hooks/useFamily';
import { useEvents } from '../hooks/useEvents';
import { useTasks } from '../hooks/useTasks';
import { useFamilyMembers } from '../hooks/useFamilyMembers';
import './DashboardPage.css';

function fmtDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('he-IL');
}

export default function DashboardPage() {
  const { user }    = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { familyId }                         = useFamily();
  const { events,  loading: eventsLoading }  = useEvents({ upcoming: true });
  const { tasks,   loading: tasksLoading }   = useTasks({ familyId });
  const { members, loading: membersLoading } = useFamilyMembers({ familyId });

  const firstName = (profile?.full_name ?? user?.user_metadata?.full_name ?? '')
    .trim().split(' ')[0] || 'משתמש';

  const thisMonth  = new Date().getMonth();
  const thisYear   = new Date().getFullYear();
  const monthCount = events.filter((e) => {
    const d = new Date(e.event_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const openTasks  = tasks.filter((t) => !t.done).length;
  const doneTasks  = tasks.filter((t) =>  t.done).length;

  const upcomingThree  = events.slice(0, 3);
  const pendingThree   = tasks.filter((t) => !t.done).slice(0, 3);

  const stat = (value, loading) => (loading ? '—' : value);

  return (
    <Layout>
      <div className="dashboard">

        <div className="dashboard-welcome">
          <div>
            <h1>{profileLoading ? 'שלום! 👋' : `שלום, ${firstName}! 👋`}</h1>
            <p className="text-muted">
              היום {new Date().toLocaleDateString('he-IL', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="dashboard-stats grid-4">
          {[
            { label: 'אירועים החודש', value: stat(monthCount,        eventsLoading),  icon: '📅', color: 'var(--color-primary)' },
            { label: 'משימות פתוחות', value: stat(openTasks,         tasksLoading),   icon: '✅', color: 'var(--color-accent)'  },
            { label: 'בני משפחה',     value: stat(members.length,    membersLoading), icon: '👨‍👩‍👧', color: '#5cb85c'              },
            { label: 'משימות שהושלמו',value: stat(doneTasks,         tasksLoading),   icon: '🏆', color: '#9b59b6'              },
          ].map((s) => (
            <div key={s.label} className="stat-card card">
              <span className="stat-icon" style={{ color: s.color }}>{s.icon}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* Upcoming events */}
          <section className="card">
            <h2 className="section-title">אירועים קרובים</h2>

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
                      <strong>{ev.title}</strong>
                      <span className="text-muted">
                        {fmtDate(ev.event_date)}
                        {ev.event_time && ` · ${ev.event_time.slice(0, 5)}`}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Pending tasks */}
          <section className="card">
            <h2 className="section-title">משימות ממתינות</h2>

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
                    <span className="event-dot" style={{ background: 'var(--color-accent)' }} />
                    <div className="event-info">
                      <strong>{task.title}</strong>
                      {task.due_date && (
                        <span className="text-muted">
                          עד {fmtDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

      </div>
    </Layout>
  );
}
