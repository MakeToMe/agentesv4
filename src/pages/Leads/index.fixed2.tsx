import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import useAuth from '../../stores/useAuth';
import { LoadingState } from '../../components/LoadingState';
import { LeadTable } from './components/LeadTable';
import LeadGrid from './components/LeadGrid';
import LeadHeader from './components/LeadHeader';
import WelcomeHeader from '../../components/WelcomeHeader';
import { useProject } from '../../contexts/ProjectContext';
import { EmptyState } from '../../components/EmptyState';
import LeadChatContainer from './components/LeadChat/LeadChatContainer';
import { Lead } from '../../hooks/useLeads';

export const Leads: React.FC = () => {
  const { empresaUid } = useAuth();
  const { selectedProject } = useProject();
  const { leads: allLeads, loading, error, updateLeadStatus } = useLeads(empresaUid);
  const [viewType, setViewType] = useState<'table' | 'grid'>('table');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filtrar leads baseado no projeto selecionado
  const leads = useMemo(() => {
    if (!allLeads) return [];
    return allLeads.filter(lead => selectedProject === 'all' || lead.lead_projeto === selectedProject);
  }, [allLeads, selectedProject]);

  const handleStatusChange = async (leadUid: string, newStatus: 'Pendente' | 'Atendido') => {
    try {
      await updateLeadStatus(leadUid, newStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleView = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleBack = () => {
    setSelectedLead(null);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <div>Erro ao carregar leads: {error}</div>;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <WelcomeHeader route="leads" hideProjectSelector={!!selectedLead} />
      
      {selectedLead ? (
        <div className="w-full px-6">
          <div className="max-w-[1370px] mx-auto">
            <LeadChatContainer 
              lead={selectedLead} 
              onBack={handleBack}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="w-full px-6">
            <div className="max-w-[1370px] mx-auto">
              <div className="space-y-6 w-full">
                <div className="w-full">
                  <LeadHeader viewType={viewType} onViewTypeChange={setViewType} />
                </div>
                
                <div className="w-full">
                  {leads.length === 0 ? (
                    <EmptyState
                      icon={<Users className="w-10 h-10 text-gray-400" />}
                      title="Nenhum lead encontrado"
                      description={
                        selectedProject === 'all'
                          ? "Você ainda não tem leads cadastrados."
                          : "Nenhum lead encontrado para o projeto selecionado."
                      }
                    />
                  ) : viewType === 'table' ? (
                    <LeadTable
                      leads={leads}
                      onStatusChange={handleStatusChange}
                      onView={handleView}
                    />
                  ) : (
                    <LeadGrid
                      leads={leads}
                      onStatusChange={handleStatusChange}
                      onView={handleView}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Leads;
