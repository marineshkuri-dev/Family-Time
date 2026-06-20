import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle()          // returns null (not an error) when row doesn't exist yet
      .then(({ data }) => {
        if (data) setProfile(data);
        setLoading(false);
      });
  }, [user]);

  return { profile, loading };
}
