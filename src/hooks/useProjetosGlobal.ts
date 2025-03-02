import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from '../stores/useAuth';

const TABLE_NAME = 'conex_projetos';

export interface ProjetoGlobal {
  uid: string;
  nome: string;
  empresa: string;
  bases?: string[];
  ativo: boolean;
  created_at: string;
}

export const useProjetosGlobal = (empresaUid: string | null) => {
  const [projetos, setProjetos] = useState<ProjetoGlobal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { isAuthenticated } = useAuth();
  const isDev = import.meta.env.DEV;

  const fetchProjetos = async () => {
    if (!empresaUid) {
      setLoading(false);
      return;
    }

    try {
      if (isDev && isAuthenticated) {
        console.log('Buscando projetos globais para empresa:', empresaUid);
      }
      
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('uid, nome, empresa, bases, ativo, created_at')
        .eq('empresa', empresaUid)
        .eq('ativo', true);

      if (error) {
        if (isDev && isAuthenticated) {
          console.error('Erro ao buscar projetos globais:', error);
        }
        throw error;
      }

      if (isDev && isAuthenticated) {
        console.log('Projetos globais encontrados:', {
          total: data?.length || 0,
          empresaUid,
          projetos: data
        });
      }
      
      setProjetos(data || []);
    } catch (err) {
      if (isDev && isAuthenticated) {
        console.error('Erro ao buscar projetos globais:', err);
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!empresaUid) {
      if (isDev && isAuthenticated) {
        console.log('Sem empresaUid disponível, pulando subscription global');
      }
      return;
    }

    // Gera um timestamp único para o canal global
    const timestamp = Date.now();
    const channelName = `projetos-global-changes-${empresaUid}-${timestamp}`;
    
    if (isDev && isAuthenticated) {
      console.log('Configurando subscription global de projetos:', {
        empresa: empresaUid,
        canal: channelName
      });
    }

    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLE_NAME,
          filter: `empresa=eq.${empresaUid}`
        },
        (payload) => {
          if (isDev && isAuthenticated) {
            console.log('Mudança em projetos globais recebida:', {
              canal: channelName,
              evento: payload.eventType,
              novo: payload.new,
              antigo: payload.old
            });
          }
          // Sempre busca novamente para garantir consistência
          fetchProjetos();
        }
      )
      .subscribe((status) => {
        if (isDev && isAuthenticated) {
          console.log('Status da subscription global:', {
            canal: channelName,
            status
          });
        }
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          fetchProjetos();
        }
      });

    return () => {
      if (isDev && isAuthenticated) {
        console.log('Limpando subscription global:', {
          canal: channelName,
          empresa: empresaUid
        });
      }
      channel.unsubscribe();
      setIsSubscribed(false);
    };
  }, [empresaUid, isAuthenticated]);

  return { projetos, loading, error, isSubscribed };
};
