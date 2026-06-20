import { useState } from 'react';
import Layout from '../components/Layout';
import { tasks as initialTasks, familyMembers } from '../data/dummyData';
import './TasksPage.css';

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const getMember = (id) => familyMembers.find((m) => m.id === id);

  const priorityClass = { גבוה: 'high', בינוני: 'mid', נמוך: 'low' };

  return (
    <Layout>
      <div className="tasks-page">
        <div className="tasks-header">
          <h1 className="section-title">משימות</h1>
          <button className="btn btn-primary">+ משימה חדשה</button>
        </div>

        <div className="tasks-stats">
          <span className="badge badge-primary">סה"כ: {tasks.length}</span>
          <span className="badge badge-success">הושלמו: {tasks.filter(t => t.done).length}</span>
          <span className="badge badge-warning">ממתינות: {tasks.filter(t => !t.done).length}</span>
        </div>

        <div className="tasks-list card">
          {tasks.map((task) => {
            const member = getMember(task.assignedTo);
            return (
              <div key={task.id} className={`task-row ${task.done ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <div className="task-row-info">
                  <strong className="task-title">{task.title}</strong>
                  <span className="text-muted">עד {new Date(task.dueDate).toLocaleDateString('he-IL')}</span>
                </div>
                <span className={`priority-badge priority-${priorityClass[task.priority]}`}>
                  {task.priority}
                </span>
                <div className="avatar avatar-sm" style={{ background: member?.color + '33', color: member?.color }}>
                  {member?.name[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
