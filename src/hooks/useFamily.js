import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

function deriveFamilyName(user) {
  const parts    = (user?.user_metadata?.full_name ?? '').trim().split(' ').filter(Boolean);
  const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0] ?? '';
  return lastName ? `משפחת ${lastName}` : 'המשפחה שלי';
}

export function useFamily() {
  const { user } = useAuth();
  const [family, setFamily]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const initFamily = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    console.log('[useFamily] init — user.id:', user.id);

    // ── Step 1: check for an existing membership ──────────────────────────
    const { data: row, error: rowErr } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('[useFamily] family_members query →', { row, error: rowErr?.message ?? null });

    if (rowErr) {
      // RLS error or network issue — fall through to RPC so it can self-heal
      console.warn('[useFamily] family_members SELECT error (non-fatal, trying RPC):', rowErr.message);
    }

    if (row?.family_id) {
      const { data: fam, error: famErr } = await supabase
        .from('families')
        .select('id, name')
        .eq('id', row.family_id)
        .maybeSingle();

      console.log('[useFamily] families query →', { fam, error: famErr?.message ?? null });

      if (fam) {
        console.log('[useFamily] resolved existing family:', fam.id, fam.name);
        setFamily(fam);
        setLoading(false);
        return;
      }
    }

    // ── Step 2: no family yet — create via RPC ────────────────────────────
    const name = deriveFamilyName(user);
    console.log('[useFamily] calling create_family_for_user RPC with family_name:', name);

    const { data: familyId, error: rpcErr } = await supabase
      .rpc('create_family_for_user', { family_name: name });

    console.log('[useFamily] RPC response →', { familyId, error: rpcErr?.message ?? null });

    if (rpcErr || !familyId) {
      const msg = rpcErr?.message ?? 'RPC returned no data';
      console.error('[useFamily] RPC failed:', msg);
      setError(msg);
      setLoading(false);
      return;
    }

    // ── Step 3: fetch the just-created family row ─────────────────────────
    const { data: fam, error: famErr } = await supabase
      .from('families')
      .select('id, name')
      .eq('id', familyId)
      .maybeSingle();

    console.log('[useFamily] post-RPC families query →', { fam, error: famErr?.message ?? null });

    const resolved = fam ?? { id: familyId, name };
    console.log('[useFamily] resolved family:', resolved.id, resolved.name);
    setFamily(resolved);
    setLoading(false);
  }, [user]);

  useEffect(() => { initFamily(); }, [initFamily]);

  return { family, familyId: family?.id ?? null, loading, error, retry: initFamily };
}
