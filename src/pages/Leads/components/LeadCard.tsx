import React from 'react';
import { Users, MoreHorizontal } from 'lucide-react';
import { Lead } from '../../../hooks/useLeads';

interface LeadCardProps {
  lead: Lead;
  onOpenModal?: (id: string) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onOpenModal }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div 
      className="rounded-lg overflow-hidden shadow-md transition-all duration-200 hover:shadow-lg"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ 
                backgroundColor: 'var(--status-success-bg)',
                border: '1px solid var(--status-success-color)30'
              }}
            >
              <Users size={24} style={{ color: 'var(--status-success-color)' }} />
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {lead.lead_nome || 'Nome não informado'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {lead.lead_whatsapp || 'WhatsApp não informado'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenModal?.(lead.uid)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Projeto</p>
            <p style={{ color: 'var(--text-primary)' }}>{lead.lead_projeto || 'Não associado'}</p>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Base</p>
            <p style={{ color: 'var(--text-primary)' }}>{lead.lead_base || 'Não associada'}</p>
          </div>
        </div>

        <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Criado em: {formatDate(lead.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
