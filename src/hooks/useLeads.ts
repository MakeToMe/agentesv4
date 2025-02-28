import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Lead {
  uid: string;
  created_at: string;
  lead_nome: string | null;
  lead_whatsapp: string | null;
  lead_perfil: string | null;
  status: 'Pendente' | 'Atendido';
  lead_projeto: string | null;
}

export const useLeads = (empresaUid: string | null, projetoUid: string | null = null) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para atualizar o status do lead
  const updateLeadStatus = async (leadUid: string, newStatus: 'Pendente' | 'Atendido') => {
    try {
      const { error } = await supabase
        .from('conex_leads')
        .update({ status: newStatus })
        .eq('uid', leadUid);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao atualizar status do lead:', err);
      throw err;
    }
  };

  // Função para buscar os leads
  const fetchLeads = async () => {
    try {
      if (!empresaUid) {
        setLeads([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('conex_leads')
        .select('*')
        .eq('led_empresa', empresaUid)
        .order('created_at', { ascending: false });

      // Aplica filtro por projeto se especificado
      if (projetoUid) {
        query = query.eq('lead_projeto', projetoUid);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLeads(data || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar leads:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar leads');
    } finally {
      setLoading(false);
    }
  };

  // Configurar Realtime subscription
  useEffect(() => {
    if (!empresaUid) return;

    setLoading(true);
    fetchLeads();

    // Criar canal único para este componente
    const channel = supabase
      .channel(`leads-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conex_leads',
          filter: `led_empresa=eq.${empresaUid}${projetoUid ? ` AND lead_projeto=eq.${projetoUid}` : ''}`
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    return () => {
      channel.unsubscribe();
    };
  }, [empresaUid, projetoUid]);

  return {
    leads,
    loading,
    isSubscribed,
    error,
    updateLeadStatus,
    refetch: fetchLeads
  };
};
