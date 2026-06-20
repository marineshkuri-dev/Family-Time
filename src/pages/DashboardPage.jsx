import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import './DashboardPage.css';

const STATS = [
  { label: 'אירועים החודש', value: 0, icon: '📅', color: 'var(--color-primary)' },
  { label: 'משימות פתוחות', value: 0, icon: '✅', color: 'var(--color-accent)' },
  { label: 'בני משפחה',     value: 0, icon: '👨‍👩‍👧', color: '#5cb85c' },
  { label: 'הושלמו השבוע',  value: 0, icon: '🏆', color: '#9b59b6' },
];

export default function DashboardPage() {
  const { user }             = useAuth();
  const { profile, loading } = useProfile();

  // Priority: profiles table → auth metadata → fallback
  const fullName  = profile?.full_name
    ?? user?.user_metadata?.full_name
    ?? null;
  const firstName = fullName ? fullName.trim().split(' ')[0] : 'משתמש';

  return (
    <Layout>
      <div className="dashboard">

        <div className="dashboard-welcome">
          <div>
            <h1>
              {loading
                ? 'שלום! 👋'
                : `שלום, ${firstName}! 👋`}
            </h1>
            <p className="text-muted">
              היום {new Date().toLocaleDateString('he-IL', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="dashboard-stats grid-4">
          {STATS.map((s) => (
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
            <div className="empty-state">
              <span className="empty-icon">📅</span>
              <p>אין אירועים קרובים</p>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">משימות ממתינות</h2>
            <div className="empty-state">
              <span className="empty-icon">✅</span>
              <p>אין משימות פתוחות</p>
            </div>
          </section>
        </div>

      </div>
    </Layout>
  );
}
