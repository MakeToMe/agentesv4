import React, { useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useProjetos } from '../hooks/useProjetos';
import useAuth from '../stores/useAuth';
import { useProject } from '../contexts/ProjectContext';
import ThemeToggle from './ThemeToggle';
import { ChevronDown, FolderOpen } from 'lucide-react';

type RouteType = 'dashboard' | 'training' | 'assistants' | 'projetos' | 'whatsapp' | 'laboratorio' | 'produtos' | 'bases' | 'leads';

interface WelcomeHeaderProps {
  route?: RouteType;
  hideProjectSelector?: boolean;
}

const getWelcomeMessage = (route: RouteType) => {
  switch (route) {
    case 'dashboard':
      return 'ao seu Dashboard';
    case 'training':
      return 'aos seus Treinamentos';
    case 'assistants':
      return 'aos seus Assistentes';
    case 'projetos':
      return 'aos seus Projetos';
    case 'whatsapp':
      return 'ao WhatsApp';
    case 'laboratorio':
      return 'ao Laboratório';
    case 'produtos':
      return 'aos seus Produtos';
    case 'bases':
      return 'às suas Bases';
    case 'leads':
      return 'Bem-vindo aos seus Leads';
    default:
      return '';
  }
};

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ 
  route = 'dashboard',
  hideProjectSelector = false 
}) => {
  const { userData } = useUser();
  const { empresaUid } = useAuth();
  const { projetos } = useProjetos(empresaUid);
  const { selectedProject, setSelectedProject } = useProject();
  const userName = userData?.user_nome || '';

  // Encontra o nome do projeto selecionado
  const selectedProjectName = selectedProject !== 'all' 
    ? projetos?.find(p => p.uid === selectedProject)?.nome 
    : null;

  return (
    <div className="w-full px-6 pt-6">
      <div className="max-w-[1370px] mx-auto">
        {/* Header com Boas-vindas */}
        <div className="rounded-lg mb-6" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
          <div className="flex justify-between items-center p-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Bem-vindo, {userName}
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                Bem-vindo {getWelcomeMessage(route)}
              </p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {projetos && projetos.length > 0 && !hideProjectSelector && (
          <div 
            className="rounded-lg p-6 mb-6"
            style={{ backgroundColor: 'var(--sidebar-bg)' }}
          >
            <div className="flex items-center gap-2">
              <FolderOpen 
                size={20} 
                style={{ color: 'var(--text-secondary)' }}
              />
              <span 
                className="font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                Projeto:
              </span>
            </div>
            
            <div className="relative flex-1">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full appearance-none px-4 py-2 pr-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="all">Todos os Projetos</option>
                {projetos.map((projeto) => (
                  <option key={projeto.uid} value={projeto.uid}>
                    {projeto.nome}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown 
                  size={20} 
                  style={{ color: 'var(--text-secondary)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeHeader;
