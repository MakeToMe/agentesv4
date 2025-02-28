import React, { useMemo } from 'react';
import { Eye } from 'lucide-react';
import { Lead } from '../../../hooks/useLeads';
import LeadStatus from './LeadStatus';
import { useProjectNames } from '../../../hooks/useProjectNames';

interface LeadGridProps {
  leads: Lead[];
  onStatusChange: (leadUid: string, newStatus: 'Pendente' | 'Atendido') => void;
  onView?: (lead: Lead) => void;
}

const LeadGrid: React.FC<LeadGridProps> = ({ leads, onStatusChange, onView }) => {
  const projectIds = useMemo(() => 
    [...new Set(leads.map(lead => lead.lead_projeto).filter(Boolean))],
    [leads]
  );
  
  const { projectNames } = useProjectNames(projectIds);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatWhatsApp = (whatsapp: string | null) => {
    if (!whatsapp) return 'Não informado';
    return whatsapp.split('@')[0];
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-transparent">
      {leads.map((lead) => (
        <div
          key={lead.uid}
          className="bg-[var(--bg-primary)] rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-colors"
        >
          {/* Cabeçalho com imagem centralizada */}
          <div className="flex justify-center p-6">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img
                src={lead.lead_perfil || ''}
                alt={lead.lead_nome || 'Perfil'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Informações principais */}
          <div className="px-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)] text-sm">Nome:</span>
              <span className="text-[var(--text-primary)] font-medium truncate">
                {lead.lead_nome || 'Não informado'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)] text-sm">WhatsApp:</span>
              <span className="text-[var(--text-primary)]">
                {formatWhatsApp(lead.lead_whatsapp)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)] text-sm">Projeto:</span>
              <span className="text-[var(--text-primary)]">
                {projectNames[lead.lead_projeto] || 'Não informado'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)] text-sm">Data:</span>
              <span className="text-[var(--text-primary)]">
                {formatDate(lead.created_at)}
              </span>
            </div>
          </div>

          {/* Linha divisória */}
          <div className="h-[1px] bg-[var(--border-color)] my-4 mx-6" />

          {/* Footer com status */}
          <div className="px-6 pb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-sm">Status:</span>
              <LeadStatus
                status={lead.status}
                onChange={(newStatus) => onStatusChange(lead.uid, newStatus)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-sm">Visualizar:</span>
              <button
                onClick={() => onView?.(lead)}
                className="flex items-center gap-2 group"
              >
                <div className="p-2 rounded-lg shadow-lg bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
                  <Eye className="w-5 h-5 text-emerald-500" />
                </div>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadGrid;
