import Layout from '../components/Layout';
import { useFamily } from '../hooks/useFamily';
import { useTasks } from '../hooks/useTasks';
import './TasksPage.css';

// Handles both Hebrew ('גבוה') and English ('high') priority values from Supabase
const PRIORITY_CSS = {
  גבוה: 'high', high: 'high',
  בינוני: 'mid', medium: 'mid', normal: 'mid',
  נמוך: 'low',  low: 'low',
};
const PRIORITY_HE = { high: 'גבוה', medium: 'בינוני', normal: 'בינוני', low: 'נמוך' };

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('he-IL');
}

export default function TasksPage() {
  const { familyId, loading: familyLoading } = useFamily();
  const { tasks, loading: tasksLoading, toggleDone } = useTasks({ familyId });

  const loading = familyLoading || tasksLoading;
  const open    = tasks.filter((t) => !t.done).length;
  const done    = tasks.filter((t) => t.done).length;

  return (
    <Layout>
      <div className="tasks-page">
        <div className="tasks-header">
          <h1 className="section-title">משימות</h1>
          <button className="btn btn-primary" disabled>+ משימה חדשה</button>
        </div>

        {!loading && tasks.length > 0 && (
          <div className="tasks-stats">
            <span className="badge badge-primary">סה"כ: {tasks.length}</span>
            <span className="badge badge-success">הושלמו: {done}</span>
            <span className="badge badge-warning">ממתינות: {open}</span>
          </div>
        )}

        <div className="tasks-list card">
          {loading && (
            <div className="empty-state">
              <p className="text-muted">טוען משימות...</p>
            </div>
          )}

          {!loading && tasks.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">✅</span>
              <p>אין משימות להצגה</p>
            </div>
          )}

          {!loading && tasks.map((task) => {
            const priorityKey = PRIORITY_CSS[task.priority] ?? '';
            const priorityLabel = PRIORITY_HE[task.priority] ?? task.priority ?? '';

            return (
              <div key={task.id} className={`task-row ${task.done ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={!!task.done}
                  onChange={() => toggleDone(task.id, task.done)}
                />
                <div className="task-row-info">
                  <strong className="task-title">{task.title}</strong>
                  {task.due_date && (
                    <span className="text-muted">עד {fmtDate(task.due_date)}</span>
                  )}
                </div>
                {priorityLabel && (
                  <span className={`priority-badge priority-${priorityKey}`}>
                    {priorityLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
