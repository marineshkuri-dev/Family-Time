import Layout from '../components/Layout';
import { events, tasks, familyMembers, currentUser } from '../data/dummyData';
import './DashboardPage.css';

export default function DashboardPage() {
  const upcomingEvents = events.slice(0, 3);
  const pendingTasks = tasks.filter((t) => !t.done).slice(0, 3);

  const getMember = (id) => familyMembers.find((m) => m.id === id);

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-welcome">
          <div>
            <h1>שלום, {currentUser.name.split(' ')[0]}! 👋</h1>
            <p className="text-muted">היום {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="dashboard-stats grid-4">
          {[
            { label: 'אירועים החודש', value: events.length,  icon: '📅', color: 'var(--color-primary)' },
            { label: 'משימות פתוחות', value: tasks.filter(t => !t.done).length, icon: '✅', color: 'var(--color-accent)' },
            { label: 'בני משפחה',     value: familyMembers.length, icon: '👨‍👩‍👧', color: '#5cb85c' },
            { label: 'הושלמו השבוע',  value: tasks.filter(t => t.done).length,  icon: '🏆', color: '#9b59b6' },
          ].map((s) => (
            <div key={s.label} className="stat-card card">
              <span className="stat-icon" style={{ color: s.color }}>{s.icon}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          <section className="card">
            <h2 className="section-title">אירועים קרובים</h2>
            <ul className="event-list">
              {upcomingEvents.map((ev) => {
                const member = getMember(ev.memberId);
                return (
                  <li key={ev.id} className="event-item">
                    <span className="event-dot" style={{ background: ev.color }} />
                    <div className="event-info">
                      <strong>{ev.title}</strong>
                      <span className="text-muted">{new Date(ev.date).toLocaleDateString('he-IL')} · {ev.time}</span>
                    </div>
                    <span className="avatar avatar-sm" style={{ background: member?.color + '33', color: member?.color }}>
                      {member?.name[0]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card">
            <h2 className="section-title">משימות ממתינות</h2>
            <ul className="task-list">
              {pendingTasks.map((task) => {
                const member = getMember(task.assignedTo);
                return (
                  <li key={task.id} className="task-item">
                    <span className={`priority-dot priority-${task.priority === 'גבוה' ? 'high' : task.priority === 'בינוני' ? 'mid' : 'low'}`} />
                    <div className="task-info">
                      <strong>{task.title}</strong>
                      <span className="text-muted">עד {new Date(task.dueDate).toLocaleDateString('he-IL')}</span>
                    </div>
                    <span className="badge badge-accent">{member?.name.split(' ')[0]}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
