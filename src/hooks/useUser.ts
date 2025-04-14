import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from '../stores/useAuth';

interface UserData {
  uid: string;
  user_nome: string;
  user_whatsApp: string;
  user_autorizado: boolean;
  user_perfil: string;
  created_at: string;
}

export const useUser = () => {
  const { userUid } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userUid) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user data for uid:', userUid);
        
        const { data, error } = await supabase
          .from('conex-users')
          .select('uid, user_nome, user_whatsApp, user_autorizado, user_perfil, created_at')
          .eq('uid', userUid)
          .single();

        console.log('User data response:', { data, error });

        if (error) throw error;

        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('conex-users-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public',
          table: 'conex-users',
          filter: `uid=eq.${userUid}`
        },
        (payload) => {
          setUserData(payload.new as UserData);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userUid]);

  return { userData, loading, error };
};
