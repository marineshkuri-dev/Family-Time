import { useState } from 'react';
import Layout from '../components/Layout';
import './SettingsPage.css';

const SETTINGS = [
  {
    section: 'התראות',
    icon: '🔔',
    items: [
      { key: 'emailNotif', label: 'קבלת התראות במייל', description: 'שלח לי תזכורות לאירועים קרובים' },
      { key: 'pushNotif', label: 'התראות דחיפה', description: 'התראות בדפדפן על עדכונים חדשים' },
      { key: 'taskReminder', label: 'תזכורות משימות', description: 'תזכרו אותי שעה לפני מועד הגשה' },
    ],
  },
  {
    section: 'פרטיות',
    icon: '🔒',
    items: [
      { key: 'shareCalendar', label: 'שיתוף לוח שנה', description: 'אפשר לבני המשפחה לראות את הלו"ז שלי' },
      { key: 'shareTasks', label: 'שיתוף משימות', description: 'הצג את המשימות שלי לכולם' },
    ],
  },
];

export default function SettingsPage() {
  const initState = {};
  SETTINGS.forEach(s => s.items.forEach(i => { initState[i.key] = true; }));
  const [toggles, setToggles] = useState(initState);

  const flip = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <Layout>
      <div className="settings-page">
        <h1 className="section-title">הגדרות</h1>

        {SETTINGS.map((section) => (
          <div key={section.section} className="settings-section card">
            <h2 className="settings-section-title">
              <span>{section.icon}</span> {section.section}
            </h2>
            {section.items.map((item) => (
              <div key={item.key} className="settings-row">
                <div className="settings-label">
                  <strong>{item.label}</strong>
                  <p className="text-muted">{item.description}</p>
                </div>
                <button
                  className={`toggle-btn ${toggles[item.key] ? 'on' : 'off'}`}
                  onClick={() => flip(item.key)}
                  aria-label={item.label}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>
            ))}
          </div>
        ))}

        <div className="card settings-danger">
          <h2 className="settings-section-title" style={{ color: 'var(--color-danger)' }}>🚨 אזור מסוכן</h2>
          <div className="settings-row">
            <div className="settings-label">
              <strong>מחיקת חשבון</strong>
              <p className="text-muted">פעולה זו בלתי הפיכה — כל הנתונים יימחקו</p>
            </div>
            <button className="btn btn-outline" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              מחק חשבון
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
