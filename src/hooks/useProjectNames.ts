import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProjectNames(projectIds: (string | null)[]) {
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchProjectNames = async () => {
    // Filtra os IDs nulos e duplicados
    const validProjectIds = [...new Set(projectIds.filter((id): id is string => id !== null))];
    
    if (validProjectIds.length === 0) {
      setProjectNames({});
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('conex_projetos')
        .select('uid, nome')
        .in('uid', validProjectIds);

      if (error) {
        console.error('[useProjectNames] Erro na query:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        setProjectNames({});
        setLoading(false);
        return;
      }

      const namesMap = data.reduce((acc, project) => {
        if (!project.uid || !project.nome) return acc;
        return {
          ...acc,
          [project.uid]: project.nome
        };
      }, {} as Record<string, string>);

      setProjectNames(namesMap);
    } catch (error) {
      console.error('[useProjectNames] Erro ao buscar nomes dos projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Busca inicial
    fetchProjectNames();

    // Filtra IDs válidos
    const validProjectIds = [...new Set(projectIds.filter((id): id is string => id !== null))];
    
    if (validProjectIds.length === 0) return;

    // Usa um nome de canal baseado nos IDs dos projetos para ser consistente
    const channelName = `project-names-${validProjectIds.sort().join('-')}`;

    // Configura subscription para mudanças nos projetos
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conex_projetos',
          filter: `uid=in.(${validProjectIds.map(id => `'${id}'`).join(',')})`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            // Atualiza apenas o nome alterado
            const newData = payload.new as { uid: string; nome: string };
            if (newData.uid && newData.nome) {
              setProjectNames(prev => ({
                ...prev,
                [newData.uid]: newData.nome
              }));
            }
          } else {
            // Para outros tipos de eventos, refetch
            fetchProjectNames();
          }
        }
      )
      .subscribe();

    // Cleanup: remove subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectIds]); // Só recria quando os IDs mudarem

  return { projectNames, loading };
}