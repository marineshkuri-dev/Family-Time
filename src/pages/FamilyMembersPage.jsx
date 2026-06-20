import Layout from '../components/Layout';
import { familyMembers, tasks, events } from '../data/dummyData';
import './FamilyMembersPage.css';

export default function FamilyMembersPage() {
  return (
    <Layout>
      <div className="family-page">
        <div className="family-header">
          <h1 className="section-title">בני המשפחה</h1>
          <button className="btn btn-primary">+ הוסף בן משפחה</button>
        </div>

        <div className="family-grid grid-2">
          {familyMembers.map((member) => {
            const memberTasks  = tasks.filter(t => t.assignedTo === member.id);
            const memberEvents = events.filter(e => e.memberId === member.id);
            const initials = member.name.split(' ').map(w => w[0]).join('');

            return (
              <div key={member.id} className="member-card card">
                <div className="member-top">
                  <div className="avatar avatar-lg" style={{ background: member.color + '22', color: member.color }}>
                    {initials}
                  </div>
                  <div className="member-info">
                    <h2>{member.name}</h2>
                    <span className="badge badge-primary">{member.role}</span>
                  </div>
                </div>
                <div className="member-stats">
                  <div className="member-stat">
                    <span className="stat-num">{memberEvents.length}</span>
                    <span className="stat-lbl">אירועים</span>
                  </div>
                  <div className="member-stat">
                    <span className="stat-num">{memberTasks.length}</span>
                    <span className="stat-lbl">משימות</span>
                  </div>
                  <div className="member-stat">
                    <span className="stat-num">{memberTasks.filter(t => t.done).length}</span>
                    <span className="stat-lbl">הושלמו</span>
                  </div>
                </div>
                <div className="member-actions">
                  <button className="btn btn-outline btn-sm">צפייה בפרופיל</button>
                  <button className="btn btn-ghost btn-sm">עריכה</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
