import React, { createContext, useContext, useState, useEffect } from 'react';
import useAuth from '../stores/useAuth';

interface KnowledgeBaseContextType {
  selectedKnowledgeBase: string;
  setSelectedKnowledgeBase: (base: string) => void;
}

const STORAGE_KEY = 'laboratorioSelectedBase';

const KnowledgeBaseContext = createContext<KnowledgeBaseContextType | undefined>(undefined);

export const KnowledgeBaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const isDev = import.meta.env.DEV;
  
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isDev && isAuthenticated) {
        console.log('Valor inicial da base no localStorage:', saved);
      }
      return saved || 'all';
    } catch (error) {
      if (isDev && isAuthenticated) {
        console.error('Erro ao ler base do localStorage:', error);
      }
      return 'all';
    }
  });

  useEffect(() => {
    if (isDev && isAuthenticated) {
      console.log('Estado atual da selectedKnowledgeBase:', selectedKnowledgeBase);
      console.log('Valor atual no localStorage:', localStorage.getItem(STORAGE_KEY));
    }
  }, [selectedKnowledgeBase, isAuthenticated]);

  const handleSetSelectedKnowledgeBase = (base: string) => {
    if (isDev && isAuthenticated) {
      console.log('Alterando base para:', base);
    }
    try {
      localStorage.setItem(STORAGE_KEY, base);
      setSelectedKnowledgeBase(base);
      if (isDev && isAuthenticated) {
        console.log('Base salva no localStorage:', localStorage.getItem(STORAGE_KEY));
      }
    } catch (error) {
      if (isDev && isAuthenticated) {
        console.error('Erro ao salvar base:', error);
      }
    }
  };

  return (
    <KnowledgeBaseContext.Provider value={{ 
      selectedKnowledgeBase, 
      setSelectedKnowledgeBase: handleSetSelectedKnowledgeBase 
    }}>
      {children}
    </KnowledgeBaseContext.Provider>
  );
};

export const useKnowledgeBase = () => {
  const context = useContext(KnowledgeBaseContext);
  if (context === undefined) {
    throw new Error('useKnowledgeBase must be used within a KnowledgeBaseProvider');
  }
  return context;
};
