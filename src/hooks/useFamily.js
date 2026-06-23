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

    if (import.meta.env.DEV) console.log('[useFamily] init — user.id:', user.id);

    // ── Step 1: look up an existing family_id from family_members ─────────
    const { data: row, error: rowErr } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (import.meta.env.DEV) console.log('[useFamily] family_members →', { row, err: rowErr?.message ?? null });

    if (rowErr) {
      console.warn('[useFamily] family_members SELECT error:', rowErr.message);
    }

    if (row?.family_id) {
      // We already know the family_id — try to also fetch family_name from families.
      // NOTE: the column is "family_name", NOT "name".
      // If this SELECT fails (e.g. RLS policy bug on the DB side), we still use
      // row.family_id so the app keeps working without creating a duplicate family.
      const { data: fam, error: famErr } = await supabase
        .from('families')
        .select('id, family_name')
        .eq('id', row.family_id)
        .maybeSingle();

      if (famErr) {
        console.error(
          '[useFamily] families SELECT failed — this likely means an RLS policy or trigger ' +
          'on the "families" table still references the old "name" column instead of "family_name". ' +
          'Check your Supabase RLS policies and any triggers on the families table.',
          famErr.message,
        );
      }

      if (import.meta.env.DEV) console.log('[useFamily] families →', { fam, err: famErr?.message ?? null });

      // Use the DB row if available; otherwise fall back to the id we already have.
      // Either way we MUST NOT fall through to the RPC — we already have a family.
      const resolved = fam ?? { id: row.family_id, family_name: null };
      if (import.meta.env.DEV) console.log('[useFamily] resolved — id:', resolved.id, 'family_name:', resolved.family_name);
      setFamily(resolved);
      setLoading(false);
      return;
    }

    // ── Step 2: no family yet — create one via RPC ────────────────────────
    // If this RPC also fails with "column name does not exist", open the Supabase
    // SQL Editor and check the body of create_family_for_user — it may INSERT into
    // families(name, ...) instead of families(family_name, ...).
    const name = deriveFamilyName(user);
    if (import.meta.env.DEV) console.log('[useFamily] calling create_family_for_user RPC — family_name:', name);

    const { data: familyId, error: rpcErr } = await supabase
      .rpc('create_family_for_user', { family_name: name });

    if (import.meta.env.DEV) console.log('[useFamily] RPC →', { familyId, err: rpcErr?.message ?? null });

    if (rpcErr || !familyId) {
      const msg = rpcErr?.message ?? 'RPC returned no data';
      console.error('[useFamily] RPC failed:', msg);
      setError(msg);
      setLoading(false);
      return;
    }

    // ── Step 3: fetch the newly-created family row ────────────────────────
    // Column: family_name (NOT name)
    const { data: fam, error: famErr } = await supabase
      .from('families')
      .select('id, family_name')
      .eq('id', familyId)
      .maybeSingle();

    if (import.meta.env.DEV) console.log('[useFamily] post-RPC families →', { fam, err: famErr?.message ?? null });

    const resolved = fam ?? { id: familyId, family_name: name };
    if (import.meta.env.DEV) console.log('[useFamily] resolved — id:', resolved.id, 'family_name:', resolved.family_name);
    setFamily(resolved);
    setLoading(false);
  }, [user]);

  useEffect(() => { initFamily(); }, [initFamily]);

  return { family, familyId: family?.id ?? null, loading, error, retry: initFamily };
}
