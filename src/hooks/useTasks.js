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

    if (fetchErr) {
      setError(fetchErr.message);
      if (import.meta.env.DEV) console.error('[useTasks] fetch error:', fetchErr.message);
    } else {
      setTasks(data ?? []);
      if (import.meta.env.DEV) console.log('[useTasks] fetched', (data ?? []).length, 'tasks — familyId:', familyId);
    }
    setLoading(false);
  }, [familyId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Optimistic toggle — reverts on Supabase error
  const toggleComplete = async (id, currentState) => {
    const next = !currentState;
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, is_completed: next } : t));

    const { error: updateErr } = await supabase
      .from('tasks')
      .update({ is_completed: next })
      .eq('id', id);

    if (updateErr) {
      console.warn('useTasks: toggle failed:', updateErr.message);
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, is_completed: currentState } : t));
      return { error: updateErr.message };
    }
    return {};
  };

  const deleteTask = async (id) => {
    const { error: deleteErr } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (deleteErr) return { error: deleteErr.message };
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return {};
  };

  // Called by TaskModal after a successful insert or update
  const applyUpsert = (upserted) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === upserted.id);
      return exists
        ? prev.map((t) => t.id === upserted.id ? upserted : t)
        : [upserted, ...prev];
    });
  };

  return { tasks, loading, error, refetch: fetchTasks, toggleComplete, deleteTask, applyUpsert };
}
