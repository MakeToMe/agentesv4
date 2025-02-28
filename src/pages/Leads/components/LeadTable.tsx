import React, { useMemo } from 'react';
import { Users, Eye } from 'lucide-react';
import { Lead } from '../../../hooks/useLeads';
import LeadStatus from './LeadStatus';
import { useProjectNames } from '../../../hooks/useProjectNames';

interface LeadTableProps {
  leads: Lead[];
  onStatusChange: (leadUid: string, newStatus: 'Pendente' | 'Atendido') => void;
  onView?: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onStatusChange,
  onView,
}) => {
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
    <div className="overflow-x-auto custom-scrollbar rounded-lg bg-[var(--bg-primary)]">
      <table className="w-full min-w-[1000px] relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--table-header-bg)' }}>
            <th className="text-left py-4 px-6 font-medium w-[300px]" style={{ color: 'var(--text-secondary)' }}>Nome</th>
            <th className="text-left py-4 px-6 font-medium w-[200px]" style={{ color: 'var(--text-secondary)' }}>Projeto</th>
            <th className="text-left py-4 px-6 font-medium w-[150px]" style={{ color: 'var(--text-secondary)' }}>WhatsApp</th>
            <th className="text-left py-4 px-6 font-medium w-[120px]" style={{ color: 'var(--text-secondary)' }}>Data</th>
            <th className="text-center py-4 px-6 font-medium w-[120px]" style={{ color: 'var(--text-secondary)' }}>Status</th>
            <th className="text-center py-4 px-6 font-medium w-[100px]" style={{ color: 'var(--text-secondary)' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.uid}
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
              <td className="py-4 px-6" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                  >
                    <img 
                      src={lead.lead_perfil || ''} 
                      alt={lead.lead_nome || 'Perfil'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {lead.lead_nome || 'Nome não informado'}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6" style={{ color: 'var(--text-secondary)' }}>
                {projectNames[lead.lead_projeto] || 'Não informado'}
              </td>
              <td className="py-4 px-6" style={{ color: 'var(--text-secondary)' }}>
                {formatWhatsApp(lead.lead_whatsapp)}
              </td>
              <td className="py-4 px-6" style={{ color: 'var(--text-secondary)' }}>
                {formatDate(lead.created_at)}
              </td>
              <td className="py-4 px-4 text-center">
                <LeadStatus
                  status={lead.status}
                  onChange={(newStatus) => onStatusChange(lead.uid, newStatus)}
                />
              </td>
              <td className="py-4 px-4 text-center">
                <button
                  onClick={() => onView?.(lead)}
                  className="inline-flex flex-col items-center group"
                >
                  <div className="p-2 rounded-lg shadow-lg bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
                    <Eye className="w-5 h-5 text-emerald-500" />
                  </div>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
