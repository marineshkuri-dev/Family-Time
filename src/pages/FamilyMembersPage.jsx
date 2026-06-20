import Layout from '../components/Layout';
import { useFamily } from '../hooks/useFamily';
import { useFamilyMembers } from '../hooks/useFamilyMembers';
import './FamilyMembersPage.css';

// Stable colour palette for member avatars — cycles by index
const AVATAR_COLORS = ['#4a90d9', '#f4a07a', '#5cb85c', '#9b59b6', '#e67e22', '#1abc9c'];

function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const ROLE_LABELS = {
  admin:  'מנהל',
  member: 'חבר משפחה',
};

export default function FamilyMembersPage() {
  const { familyId, loading: familyLoading } = useFamily();
  const { members, loading: membersLoading } = useFamilyMembers({ familyId });

  const loading = familyLoading || membersLoading;

  return (
    <Layout>
      <div className="family-page">
        <div className="family-header">
          <h1 className="section-title">בני המשפחה</h1>
          <button className="btn btn-primary" disabled>+ הוסף בן משפחה</button>
        </div>

        {loading && (
          <div className="empty-state">
            <p className="text-muted">טוען בני משפחה...</p>
          </div>
        )}

        {!loading && members.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">👨‍👩‍👧</span>
            <p>עדיין לא נוספו בני משפחה</p>
          </div>
        )}

        {!loading && members.length > 0 && (
          <div className="family-grid grid-2">
            {members.map((member, idx) => {
              const color    = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const name     = member.full_name ?? (member.isCurrentUser ? 'אני' : 'בן משפחה');
              const initials = getInitials(name);
              const roleLabel = ROLE_LABELS[member.role] ?? member.role ?? 'חבר משפחה';

              return (
                <div key={member.id} className="member-card card">
                  <div className="member-top">
                    <div
                      className="avatar avatar-lg"
                      style={{ background: color + '22', color }}
                    >
                      {initials}
                    </div>
                    <div className="member-info">
                      <h2>{name}</h2>
                      <span className="badge badge-primary">{roleLabel}</span>
                      {member.email && (
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {member.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="member-actions">
                    <button className="btn btn-ghost btn-sm" disabled>עריכה</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
