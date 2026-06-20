import { useState } from 'react';
import Layout from '../components/Layout';
import FamilyMemberModal from '../components/FamilyMemberModal';
import { useFamily } from '../hooks/useFamily';
import { useFamilyMembers } from '../hooks/useFamilyMembers';
import './FamilyMembersPage.css';

const AVATAR_COLORS = ['#4a90d9', '#f4a07a', '#5cb85c', '#9b59b6', '#e67e22', '#1abc9c'];

function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const ROLE_LABEL_MAP = { admin: 'מנהל', member: 'חבר משפחה' };
function roleLabel(role) {
  return ROLE_LABEL_MAP[role] ?? role ?? 'חבר משפחה';
}

export default function FamilyMembersPage() {
  const { familyId, loading: familyLoading }                                         = useFamily();
  const { members, loading: membersLoading, error, applyUpsert, deleteMember }       =
    useFamilyMembers({ familyId });

  const [editMember, setEditMember]       = useState(null);
  const [modalOpen, setModalOpen]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loading = familyLoading || membersLoading;

  const openAdd    = ()  => { setEditMember(undefined); setModalOpen(true); };
  const openEdit   = (m) => { setEditMember(m); setModalOpen(true); };
  const closeModal = ()  => { setModalOpen(false); setEditMember(null); };

  const handleSaved = (upserted) => applyUpsert(upserted);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    const { error: deleteErr } = await deleteMember(id);
    setDeleteLoading(false);
    if (deleteErr) {
      alert(deleteErr);
    } else {
      setConfirmDelete(null);
    }
  };

  return (
    <Layout>
      <div className="family-page">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="family-header">
          <h1 className="section-title">בני המשפחה</h1>
          <button
            className="btn btn-primary"
            onClick={openAdd}
            disabled={!familyId || loading}
          >
            + הוסף בן משפחה
          </button>
        </div>

        {/* ── Error / Loading / Empty ─────────────────────────── */}
        {error && <div className="auth-error">{error}</div>}

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

        {/* ── Member grid ────────────────────────────────────── */}
        {!loading && members.length > 0 && (
          <div className="family-grid grid-2">
            {members.map((member, idx) => {
              const color    = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const name     = member.display_name ?? (member.isCurrentUser ? 'אני' : 'בן משפחה');
              const initials = getInitials(name);
              const label    = roleLabel(member.role);

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
                      <h2>
                        {name}
                        {member.isCurrentUser && (
                          <span className="member-me-badge">אני</span>
                        )}
                      </h2>
                      <span className="badge badge-primary">{label}</span>
                      {member.email && (
                        <span className="text-muted member-email">{member.email}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="member-actions">
                    {confirmDelete === member.id ? (
                      <>
                        <span className="confirm-text">למחוק את {name}?</span>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setConfirmDelete(null)}
                          disabled={deleteLoading}
                        >
                          ביטול
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(member.id)}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? '...' : 'מחק'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => { setConfirmDelete(null); openEdit(member); }}
                        >
                          עריכה
                        </button>
                        {!member.isCurrentUser && (
                          <button
                            className="btn btn-ghost btn-sm text-danger"
                            onClick={() => { closeModal(); setConfirmDelete(member.id); }}
                          >
                            מחיקה
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────────── */}
      {modalOpen && (
        <FamilyMemberModal
          member={editMember ?? null}
          familyId={familyId}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </Layout>
  );
}
