import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Fetches events from Supabase.
 *
 * Options:
 *   familyId — when provided, fetch ALL family events (by family_id).
 *              Otherwise filter by created_by = user.id (backward compat).
 *   upcoming  — only fetch events on or after today (ignored if familyId is set
 *               and you need all events for month counting).
 */
export function useEvents({ upcoming = false, familyId = null } = {}) {
  const { user } = useAuth();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    let query = supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (familyId) {
      // Family-wide view: RLS ensures only our family's events are returned
      query = query.eq('family_id', familyId);
    } else {
      query = query.eq('created_by', user.id);
    }

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('event_date', today);
    }

    const { data, error: fetchError } = await query;
    if (fetchError) setError(fetchError.message);
    else setEvents(data ?? []);
    setLoading(false);
  }, [user, upcoming, familyId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}
