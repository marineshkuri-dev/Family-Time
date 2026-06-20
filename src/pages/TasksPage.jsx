import { useState } from 'react';
import Layout from '../components/Layout';
import TaskModal from '../components/TaskModal';
import RecurrenceBadge from '../components/RecurrenceBadge';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../hooks/useFamily';
import { useTasks } from '../hooks/useTasks';
import './TasksPage.css';

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('he-IL');
}

// Handles both Hebrew and English priority values stored in Supabase
const PRIORITY_CSS   = { גבוה: 'high', high: 'high', בינוני: 'mid', medium: 'mid', נמוך: 'low', low: 'low' };
const PRIORITY_LABEL = { high: 'גבוה', medium: 'בינוני', low: 'נמוך' };

export default function TasksPage() {
  const { user }                              = useAuth();
  const { familyId, loading: familyLoading } = useFamily();
  const { tasks, loading: tasksLoading, error, toggleComplete, deleteTask, applyUpsert } =
    useTasks({ familyId });

  // Modal state: null = closed, undefined = add mode, task object = edit mode
  const [editTask, setEditTask]           = useState(null);
  const [modalOpen, setModalOpen]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);  // task id
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loading = familyLoading || tasksLoading;

  const openAdd  = () => { setEditTask(undefined); setModalOpen(true); };
  const openEdit = (task) => { setEditTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTask(null); };

  const handleSaved = (upserted) => { applyUpsert(upserted); };

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    const { error: deleteErr } = await deleteTask(id);
    setDeleteLoading(false);
    if (deleteErr) {
      alert(deleteErr); // surface delete error simply
    } else {
      setConfirmDelete(null);
    }
  };

  const open      = tasks.filter((t) => !t.is_completed).length;
  const completed = tasks.filter((t) =>  t.is_completed).length;

  return (
    <Layout>
      <div className="tasks-page">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="tasks-header">
          <h1 className="section-title">משימות</h1>
          <button
            className="btn btn-primary"
            onClick={openAdd}
            disabled={!familyId || loading}
          >
            + משימה חדשה
          </button>
        </div>

        {/* ── Error ─────────────────────────────────────────────── */}
        {error && <div className="auth-error">{error}</div>}

        {/* ── Stats bar ─────────────────────────────────────────── */}
        {!loading && tasks.length > 0 && (
          <div className="tasks-stats">
            <span className="badge badge-primary">סה"כ: {tasks.length}</span>
            <span className="badge badge-success">הושלמו: {completed}</span>
            <span className="badge badge-warning">ממתינות: {open}</span>
          </div>
        )}

        {/* ── Task list ─────────────────────────────────────────── */}
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
            const priorityCss   = PRIORITY_CSS[task.priority]   ?? '';
            const priorityLabel = PRIORITY_LABEL[task.priority] ?? task.priority ?? '';

            return (
              <div
                key={task.id}
                className={`task-row ${task.is_completed ? 'done' : ''}`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={!!task.is_completed}
                  title={task.is_completed ? 'סמן כפתוחה' : 'סמן כהושלמה'}
                  onChange={() => toggleComplete(task.id, task.is_completed)}
                />

                {/* Info */}
                <div className="task-row-info">
                  <span className="task-title-row">
                    <strong className="task-title">{task.title}</strong>
                    <RecurrenceBadge type={task.recurrence_type} />
                  </span>
                  {task.description && (
                    <span className="task-desc">{task.description}</span>
                  )}
                  {task.due_date && (
                    <span className="text-muted">עד {fmtDate(task.due_date)}</span>
                  )}
                </div>

                {/* Priority badge */}
                {priorityLabel && (
                  <span className={`priority-badge priority-${priorityCss}`}>
                    {priorityLabel}
                  </span>
                )}

                {/* Edit / Delete */}
                <div className="task-actions">
                  {confirmDelete === task.id ? (
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
                        onClick={() => handleDelete(task.id)}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? '...' : 'מחק'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => { setConfirmDelete(null); openEdit(task); }}
                      >
                        עריכה
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-danger"
                        onClick={() => { closeModal(); setConfirmDelete(task.id); }}
                      >
                        מחיקה
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────── */}
      {modalOpen && (
        <TaskModal
          task={editTask ?? null}
          familyId={familyId}
          userId={user?.id}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </Layout>
  );
}
