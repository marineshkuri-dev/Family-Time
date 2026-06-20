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

    // Fetch member rows
    const { data: rows, error: rowsErr } = await supabase
      .from('family_members')
      .select('id, role, user_id, created_at')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

    if (rowsErr) {
      setError(rowsErr.message);
      setLoading(false);
      return;
    }

    // Fetch profiles for those user IDs.
    // The profiles RLS (id = auth.uid()) means only the current user's
    // profile is returned — other members' profiles will be absent from the map.
    const userIds = (rows ?? []).map((r) => r.user_id);
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });
    }

    const enriched = (rows ?? []).map((row) => ({
      ...row,
      full_name:     profileMap[row.user_id]?.full_name ?? null,
      email:         profileMap[row.user_id]?.email     ?? null,
      isCurrentUser: row.user_id === user?.id,
    }));

    setMembers(enriched);
    setLoading(false);
  }, [familyId, user]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  return { members, loading, error };
}
