import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useTasks({ familyId = null } = {}) {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!familyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const { data, error: fetchErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (fetchErr) setError(fetchErr.message);
    else setTasks(data ?? []);
    setLoading(false);
  }, [familyId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const toggleDone = async (id, currentDone) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !currentDone } : t));

    const { error: updateErr } = await supabase
      .from('tasks')
      .update({ done: !currentDone })
      .eq('id', id);

    if (updateErr) {
      // Revert on failure
      console.warn('useTasks: toggle failed:', updateErr.message);
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: currentDone } : t));
    }
  };

  return { tasks, loading, error, refetch: fetchTasks, toggleDone };
}
