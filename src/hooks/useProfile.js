import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchOrCreate = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const { data, error: fetchErr } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', user.id)
      .maybeSingle();

    if (fetchErr) {
      setError(fetchErr.message);
      setLoading(false);
      return;
    }

    if (data) {
      setProfile(data);
      setLoading(false);
      return;
    }

    // Row missing — create it from auth metadata
    const fallbackName = user.user_metadata?.full_name ?? null;
    const { data: created, error: createErr } = await supabase
      .from('profiles')
      .upsert(
        { id: user.id, email: user.email, full_name: fallbackName },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (createErr) {
      setError(createErr.message);
    } else {
      setProfile(created);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchOrCreate(); }, [fetchOrCreate]);

  // Updates the profiles table AND syncs auth user_metadata so Navbar
  // initials refresh automatically via onAuthStateChange.
  const updateProfile = async ({ full_name }) => {
    if (!user) return { error: 'לא מחובר' };

    const trimmed = full_name?.trim() || null;

    const { data, error: updateErr } = await supabase
      .from('profiles')
      .update({ full_name: trimmed })
      .eq('id', user.id)
      .select()
      .single();

    if (updateErr) return { error: updateErr.message };

    // Sync to auth metadata — triggers onAuthStateChange → Navbar re-renders
    await supabase.auth.updateUser({ data: { full_name: trimmed } });

    setProfile(data);
    return { data };
  };

  return { profile, loading, error, updateProfile };
}
