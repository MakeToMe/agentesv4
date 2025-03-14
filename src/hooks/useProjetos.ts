import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TABLE_NAME = 'conex_projetos';

export interface Projeto {
  uid: string;
  nome: string;
  empresa: string;
  bases?: string[];
  ativo: boolean;
  created_at: string;
}

export const useProjetos = (empresaUid: string | null) => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const fetchProjetos = async () => {
    if (!empresaUid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Buscando projetos para empresa:', empresaUid);
      
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('uid, nome, empresa, bases, ativo, created_at')
        .eq('empresa', empresaUid)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar projetos:', error);
        throw error;
      }

      console.log('Projetos encontrados:', {
        total: data?.length || 0,
        empresaUid,
        projetos: data
      });
      
      setProjetos(data || []);
    } catch (err) {
      console.error('Erro ao buscar projetos:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!empresaUid) {
      console.log('Sem empresaUid disponível, pulando subscription');
      return;
    }

    // Gera um timestamp único para o canal
    const timestamp = Date.now();
    const channelName = `projetos-changes-${empresaUid}-${timestamp}`;
    
    console.log('Configurando subscription de projetos:', {
      empresa: empresaUid,
      canal: channelName
    });

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
          console.log('Mudança em projetos recebida:', {
            canal: channelName,
            evento: payload.eventType,
            novo: payload.new,
            antigo: payload.old
          });
          // Sempre busca novamente para garantir consistência
          fetchProjetos();
        }
      )
      .subscribe((status) => {
        console.log('Status da subscription:', {
          canal: channelName,
          status
        });
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          fetchProjetos();
        }
      });

    return () => {
      console.log('Limpando subscription:', {
        canal: channelName,
        empresa: empresaUid
      });
      channel.unsubscribe();
      setIsSubscribed(false);
    };
  }, [empresaUid]);

  return { projetos, loading, error, isSubscribed, fetchProjetos };
};
