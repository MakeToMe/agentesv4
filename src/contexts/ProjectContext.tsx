import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProjetosGlobal } from '../hooks/useProjetosGlobal';
import useAuth from '../stores/useAuth';

interface ProjectContextType {
  selectedProject: string;
  setSelectedProject: (project: string) => void;
}

const STORAGE_KEY = 'dashboardSelectedProject';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { empresaUid, isAuthenticated } = useAuth();
  const { projetos } = useProjetosGlobal(empresaUid);
  const isDev = import.meta.env.DEV;
  
  const [selectedProject, setSelectedProject] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isDev && isAuthenticated) {
        console.log('Valor inicial do localStorage:', saved);
      }
      return saved || 'all';
    } catch (error) {
      if (isDev && isAuthenticated) {
        console.error('Erro ao ler do localStorage:', error);
      }
      return 'all';
    }
  });

  // Validar se o projeto selecionado ainda existe
  useEffect(() => {
    if (selectedProject !== 'all' && projetos.length > 0) {
      const projetoExiste = projetos.some(p => p.uid === selectedProject);
      if (!projetoExiste) {
        if (isDev && isAuthenticated) {
          console.log('Projeto selecionado não existe mais, resetando para "all"');
        }
        handleSetSelectedProject('all');
      }
    }
  }, [projetos, selectedProject, isAuthenticated]);

  useEffect(() => {
    if (isDev && isAuthenticated) {
      console.log('Estado atual do selectedProject:', selectedProject);
      console.log('Valor atual no localStorage:', localStorage.getItem(STORAGE_KEY));
    }
  }, [selectedProject, isAuthenticated]);

  const handleSetSelectedProject = (project: string) => {
    if (isDev && isAuthenticated) {
      console.log('Alterando projeto para:', project);
    }
    try {
      localStorage.setItem(STORAGE_KEY, project);
      setSelectedProject(project);
      if (isDev && isAuthenticated) {
        console.log('Projeto salvo no localStorage:', localStorage.getItem(STORAGE_KEY));
      }
    } catch (error) {
      if (isDev && isAuthenticated) {
        console.error('Erro ao salvar projeto:', error);
      }
    }
  };

  return (
    <ProjectContext.Provider value={{ 
      selectedProject, 
      setSelectedProject: handleSetSelectedProject 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};