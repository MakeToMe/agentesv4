import React, { useState, useMemo } from 'react';
import WelcomeHeader from '../../components/WelcomeHeader';
import { useKnowledgeBases } from '../../hooks/useKnowledgeBases';
import { ViewType } from '../Treinamentos/types';
import { KnowledgeBaseHeader } from './components/KnowledgeBaseHeader';
import KnowledgeBaseTable from './components/KnowledgeBaseTable';
import ModalAddBase from './components/ModalAddBase';
import ModalViewBase from './components/ModalViewBase';
import ModalDeleteBase from './components/ModalDeleteBase';
import ModalPersonalizarBase from './components/ModalPersonalizarBase';
import { EmptyState } from '../../components/EmptyState';
import { Database } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import useAuth from '../../stores/useAuth';
import { useProjetosSelect } from '../../hooks/useProjetosSelect';

const Bases: React.FC = () => {
  const { 
    bases, 
    loading: basesLoading, 
    error, 
    deleteBase, 
    addBase, 
    updateBasePrompt,
    updateBaseTipo,
    updateBaseLgpd
  } = useKnowledgeBases();
  const { userUid, empresaUid } = useAuth();
  const { selectedProject } = useProject();
  const { projetos, loading: loadingProjetos } = useProjetosSelect(empresaUid);
  const [isAddingBase, setIsAddingBase] = useState(false);
  const [baseViewType, setBaseViewType] = useState<ViewType>(() => {
    const savedViewType = localStorage.getItem('basesViewType');
    return (savedViewType as ViewType) || 'table';
  });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; base: any | null }>({
    isOpen: false,
    base: null,
  });
  const [personalizarModal, setPersonalizarModal] = useState<{ isOpen: boolean; base: any | null }>({
    isOpen: false,
    base: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; base: any | null }>({
    isOpen: false,
    base: null,
  });

  const loading = basesLoading || loadingProjetos;

  // Filtro dos dados baseado no projeto selecionado
  const filteredBases = useMemo(() => {
    if (!bases) return [];
    if (selectedProject === 'all') {
      return [...bases];
    }
    return bases.filter(base => base.projeto === selectedProject);
  }, [bases, selectedProject]);

  const handleCloseAddBaseModal = () => {
    setIsAddingBase(false);
  };

  const handleConfirmAddBase = async (name: string, projectId: string): Promise<string> => {
    try {
      const result = await addBase(name, projectId);
      setIsAddingBase(false);
      return result.uid || result.id || '';
    } catch (error) {
      console.error('Erro ao adicionar base:', error);
      throw error;
    }
  };

  const handleBaseViewTypeChange = (type: ViewType) => {
    setBaseViewType(type);
    localStorage.setItem('basesViewType', type);
  };

  const handleCloseDeleteModalBase = () => {
    setDeleteModal({ isOpen: false, base: null });
  };

  const handleDeleteBase = async () => {
    if (!deleteModal.base) return { success: false, message: 'Base não encontrada' };
    return await deleteBase(deleteModal.base.uid);
  };

  const handlePersonalizar = async (base: any, prompt: string) => {
    try {
      await updateBasePrompt(base.uid, prompt);
    } catch (error) {
      console.error('Erro ao atualizar prompt:', error);
    }
  };

  const handleUpdateTipo = async (base: KnowledgeBase, tipo: string) => {
    try {
      await updateBaseTipo(base.uid, tipo);
    } catch (error) {
      console.error('Erro ao atualizar tipo:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-red-500">Carregando...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar bases: {error}</div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sidebar-active-bg)' }}>
      <WelcomeHeader route="bases" />
      <div className="w-full px-4 pb-4 pt-4 sm:pb-6">
        <div className="max-w-[1370px] mx-auto">
          <div>
            <KnowledgeBaseHeader
              viewType={baseViewType}
              onViewTypeChange={handleBaseViewTypeChange}
              onAddBase={() => setIsAddingBase(true)}
            />
            <div className="mt-4">
              {filteredBases.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    icon={Database}
                    title="Nenhuma base de conhecimento"
                    description="Você ainda não possui nenhuma base de conhecimento. Crie uma nova base para começar."
                  />
                </div>
              ) : (
                <KnowledgeBaseTable
                  bases={filteredBases}
                  viewType={baseViewType}
                  onView={(base) => setViewModal({ isOpen: true, base })}
                  onDeleteBase={(base) => setDeleteModal({ isOpen: true, base })}
                  onPersonalizar={(base) => setPersonalizarModal({ isOpen: true, base })}
                  onUpdateTipo={async (base, tipo) => {
                    const result = await updateBaseTipo(base.uid, tipo);
                    if (!result.success) {
                      console.error('Erro ao atualizar tipo:', result.message);
                    }
                  }}
                  onUpdateLgpd={async (base, lgpd) => {
                    const result = await updateBaseLgpd(base.uid, lgpd);
                    if (!result.success) {
                      console.error('Erro ao atualizar LGPD:', result.message);
                    }
                  }}
                />
              )}
            </div>
          </div>

          {isAddingBase && (
            <ModalAddBase
              isOpen={isAddingBase}
              onClose={handleCloseAddBaseModal}
              onConfirm={handleConfirmAddBase}
            />
          )}

          <ModalViewBase
            isOpen={viewModal.isOpen}
            onClose={() => setViewModal({ isOpen: false, base: null })}
            base={viewModal.base}
          />

          <ModalPersonalizarBase
            isOpen={personalizarModal.isOpen}
            onClose={() => setPersonalizarModal({ isOpen: false, base: null })}
            base={personalizarModal.base}
            onConfirm={handlePersonalizar}
          />

          <ModalDeleteBase
            isOpen={deleteModal.isOpen}
            onClose={handleCloseDeleteModalBase}
            onConfirm={handleDeleteBase}
            base={deleteModal.base}
          />
        </div>
      </div>
    </div>
  );
};

export default Bases;
