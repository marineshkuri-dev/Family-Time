import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useFamilyMembers({ familyId = null } = {}) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!familyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    // Fetch member rows — full_name and avatar_url are now stored directly
    const { data: rows, error: rowsErr } = await supabase
      .from('family_members')
      .select('id, role, user_id, full_name, avatar_url, created_at')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

    if (rowsErr) {
      setError(rowsErr.message);
      setLoading(false);
      return;
    }

    // Supplement with profiles for registered users whose full_name is not yet
    // stored in the family_members row (e.g. the account that first created the family).
    const registeredIds = (rows ?? [])
      .filter((r) => r.user_id && !r.full_name)
      .map((r) => r.user_id);

    let profileMap = {};
    if (registeredIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', registeredIds);
      (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });
    }

    const enriched = (rows ?? []).map((row) => ({
      ...row,
      // display_name: prefer row.full_name, fall back to profiles join
      display_name:  row.full_name ?? profileMap[row.user_id]?.full_name ?? null,
      email:         profileMap[row.user_id]?.email ?? null,
      isCurrentUser: row.user_id === user?.id,
    }));

    setMembers(enriched);
    setLoading(false);
  }, [familyId, user]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // Called by FamilyMemberModal after a successful insert / update
  const applyUpsert = (upserted) => {
    const enriched = {
      ...upserted,
      display_name:  upserted.full_name ?? null,
      email:         null,
      isCurrentUser: upserted.user_id === user?.id,
    };
    setMembers((prev) => {
      const exists = prev.some((m) => m.id === enriched.id);
      return exists
        ? prev.map((m) => m.id === enriched.id ? enriched : m)
        : [...prev, enriched];
    });
  };

  const deleteMember = async (id) => {
    const { error: deleteErr } = await supabase
      .from('family_members')
      .delete()
      .eq('id', id);
    if (deleteErr) return { error: deleteErr.message };
    setMembers((prev) => prev.filter((m) => m.id !== id));
    return {};
  };

  return { members, loading, error, refetch: fetchMembers, applyUpsert, deleteMember };
}
