import { useEffect, useState, useCallback } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import useAuth from '../stores/useAuth';

export interface Conversa {
  uid: string;
  created_at: string;
  mensagem: string | null;
  origem: string | null;
  remote_jid: string | null;
  messageTimestamp: string | null;
  messageType: string | null;
  fonte_tipo: string | null;
}

export interface ContagemPorOrigem {
  assistente: number;
  humano: number;
}

export const useConversas = (leadWhatsapp?: string | null) => {
  const { empresaUid } = useAuth();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [contagem, setContagem] = useState<ContagemPorOrigem>({ assistente: 0, humano: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversas = useCallback(async () => {
    if (!empresaUid) {
      setConversas([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('conex_conversas')
        .select('*')
        .eq('empresa', empresaUid);

      // Se tiver leadWhatsapp, filtra por ele
      if (leadWhatsapp) {
        query = query.eq('remote_jid', leadWhatsapp);
      }

      // Se não tiver leadWhatsapp, busca apenas últimos 30 dias para o dashboard
      if (!leadWhatsapp) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('created_at', thirtyDaysAgo.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;

      setConversas(data || []);

      // Atualiza contagem apenas se não tiver leadWhatsapp (dashboard)
      if (!leadWhatsapp) {
        const contagemTemp = { assistente: 0, humano: 0 };
        data?.forEach(conversa => {
          if (conversa.origem === 'Assistente') {
            contagemTemp.assistente++;
          } else if (conversa.origem === 'Humano') {
            contagemTemp.humano++;
          }
        });
        setContagem(contagemTemp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  }, [empresaUid, leadWhatsapp]);

  useEffect(() => {
    fetchConversas();

    // Inscrever no canal de realtime
    const channel = supabase
      .channel(`conex-conversas-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conex_conversas',
          filter: `empresa=eq.${empresaUid}`,
        },
        (payload: RealtimePostgresChangesPayload<Conversa>) => {
          if (!leadWhatsapp || (payload.new && payload.new.remote_jid === leadWhatsapp)) {
            fetchConversas();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaUid, leadWhatsapp, fetchConversas]);

  return { conversas, contagem, loading, error };
};