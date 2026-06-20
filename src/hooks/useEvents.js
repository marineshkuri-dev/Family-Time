import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useEvents({ upcoming = false } = {}) {
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
      .eq('created_by', user.id)
      .order('event_date', { ascending: true });

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('event_date', today);
    }

    const { data, error: fetchError } = await query;
    if (fetchError) setError(fetchError.message);
    else setEvents(data ?? []);
    setLoading(false);
  }, [user, upcoming]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}
