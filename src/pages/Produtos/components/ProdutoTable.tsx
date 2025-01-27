import React, { useMemo, useEffect, useState } from 'react';
import { format, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TrainingData } from '../../../types/training';
import { StatusIndicator } from '../../Treinamentos/components/StatusIndicator';
import { Package } from 'lucide-react';
import { ProdutoActionButtons } from './ProdutoActionButtons';
import { useProjectNames } from '../../../hooks/useProjectNames';
import { supabase } from '../../../lib/supabase';

interface ProdutoTableProps {
  trainings: TrainingData[];
  onOpenModal: (id: string, phase: string) => void;
  onOpenDeleteModal: (training: TrainingData) => void;
  isDeletingTraining: string | null;
}

export const ProdutoTable: React.FC<ProdutoTableProps> = ({
  trainings,
  onOpenModal,
  onOpenDeleteModal,
  isDeletingTraining
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [renderedTrainings, setRenderedTrainings] = useState<TrainingData[]>([]);

  const projectIds = useMemo(() => 
    [...new Set(trainings.map(training => training.projeto || null).filter(Boolean))],
    [trainings]
  );
  
  const { projectNames, loading: loadingProjects } = useProjectNames(projectIds);

  useEffect(() => {
    setIsLoading(true);
    setRenderedTrainings(trainings);
    setIsLoading(false);
  }, [trainings]);

  useEffect(() => {
    console.log('Trainings atualizados:', trainings);
    console.log('Rendered trainings:', renderedTrainings);
    trainings.forEach(training => {
      console.log(`Training ${training.uid} - fase:`, training.fase);
    });
  }, [trainings, renderedTrainings]);

  const formatDate = (dateString: string) => {
    const date = addHours(new Date(dateString), -3);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatBaseName = (nome: string | null | undefined) => {
    if (!nome || nome === 'Aguardando') return nome || 'Aguardando';
    return nome.split('_')[0];
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full min-w-[1000px] relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--table-header-bg)' }}>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Projeto</th>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Data</th>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Origem</th>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Base</th>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Resumo</th>
            <th className="text-center py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
            <th className="text-center py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Ações</th>
          </tr>
        </thead>
        <tbody style={{ opacity: isLoading ? '0.5' : '1', transition: 'opacity 0.2s ease-in-out' }}>
          {renderedTrainings.map((training) => (
            <tr
              key={training.uid}
              className="border-b"
              style={{ 
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                transition: 'background-color 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              <td className="py-4 px-4" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: 'var(--status-success-bg)',
                      border: '1px solid var(--status-success-color)30'
                    }}
                  >
                    <Package size={20} style={{ color: 'var(--status-success-color)' }} />
                  </div>
                  <span>
                    {training.projeto ? (loadingProjects ? '...' : projectNames[training.projeto] || '-') : '-'}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4" style={{ color: 'var(--text-secondary)' }}>
                {training.created_at ? formatDate(training.created_at) : '-'}
              </td>
              <td className="py-4 px-4" style={{ color: 'var(--text-secondary)' }}>
                {training.origem || 'Não informado'}
              </td>
              <td className="py-4 px-4" style={{ color: 'var(--text-secondary)' }}>
                {formatBaseName(training.base)}
              </td>
              <td className="py-4 px-4" style={{ color: 'var(--text-secondary)' }}>
                {training.resumo || 'Não informado'}
              </td>
              <td className="py-4 px-4 text-center">
                <div className="flex justify-center">
                  <StatusIndicator status={training.fase || 'aguardando'} />
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <div className="flex justify-center">
                  <ProdutoActionButtons
                    training={training}
                    onOpenModal={(id) => onOpenModal(id, training.fase || 'aguardando')}
                    onOpenDeleteModal={onOpenDeleteModal}
                    isDeletingTraining={isDeletingTraining}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
