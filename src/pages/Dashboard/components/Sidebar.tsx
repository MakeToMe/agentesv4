import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircle2, 
  GraduationCap,
  Bot, 
  BarChart2, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Building,
  FolderOpen,
  MessageCircle,
  Beaker,
  Package2,
  Database,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../stores/useAuth';

type ActiveScreen = 'dashboard' | 'treinamentos' | 'assistants' | 'projetos' | 'knowledge-bases' | 'whatsapp' | 'laboratorio' | 'produtos' | 'bases' | 'leads';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  userName: string;
  userProfile?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  toggleCollapse,
  activeScreen,
  setActiveScreen,
  userName,
  userProfile
}) => {
  const navigate = useNavigate();
  const { clearAuth } = useAuth();

  const handleLogout = () => {
    clearAuth();
    // Pequeno delay para garantir que os dados foram limpos
    setTimeout(() => {
      navigate('/');
    }, 100);
  };

  const handleScreenChange = (screen: ActiveScreen | null) => {
    if (screen) {
      setActiveScreen(screen);
      if (screen === 'dashboard') navigate('/dashboard');
      else if (screen === 'whatsapp') navigate('/whatsapp');
      else if (screen === 'projetos') navigate('/projetos');
      else if (screen === 'treinamentos') navigate('/treinamentos');
      else if (screen === 'produtos') navigate('/produtos');
      else if (screen === 'leads') navigate('/leads');
      else if (screen === 'laboratorio') navigate('/laboratorio');
      else if (screen === 'bases') navigate('/bases');
    }
  };

  const DEFAULT_PROFILE_IMAGE = 'https://tfmzozvazfbrapkzxrcz.supabase.co/storage/v1/object/public/conexia/user-perfil.png';

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      screen: 'dashboard' as ActiveScreen,
      path: '/dashboard',
      active: activeScreen === 'dashboard'
    },
    { 
      icon: FolderOpen, 
      label: 'Projetos', 
      screen: 'projetos' as ActiveScreen,
      path: '/projetos',
      active: activeScreen === 'projetos'
    },
    { 
      icon: MessageCircle,
      label: 'WhatsApp',
      screen: 'whatsapp' as ActiveScreen,
      path: '/whatsapp',
      active: activeScreen === 'whatsapp'
    },
    {
      icon: Database,
      label: 'Bases',
      screen: 'bases' as ActiveScreen,
      path: '/bases',
      active: activeScreen === 'bases'
    },
    { 
      icon: GraduationCap, 
      label: 'Treinamentos', 
      screen: 'treinamentos' as ActiveScreen,
      path: '/treinamentos',
      active: activeScreen === 'treinamentos'
    },
    {
      icon: Package2,
      label: 'Produtos',
      screen: 'produtos' as ActiveScreen,
      path: '/produtos',
      active: activeScreen === 'produtos'
    },
    {
      icon: Users,
      label: 'Leads',
      screen: 'leads' as ActiveScreen,
      path: '/leads',
      active: activeScreen === 'leads'
    },
    {
      icon: Beaker,
      label: 'Laboratório',
      screen: 'laboratorio' as ActiveScreen,
      path: '/laboratorio',
      active: activeScreen === 'laboratorio'
    }
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? '5rem' : '16rem' }}
      className={`relative h-screen flex flex-col bg-[var(--sidebar-bg)] transition-all duration-300 ease-in-out`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={userProfile || DEFAULT_PROFILE_IMAGE}
            alt="Profile"
            className="w-10 h-10 rounded-lg object-cover"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-[var(--sidebar-text)] truncate">
                {userName}
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => handleScreenChange(item.screen)}
                disabled={!item.screen}
                className={`w-full flex items-center gap-3 transition-all duration-300 relative overflow-hidden py-3
                  ${item.active 
                    ? 'text-[var(--sidebar-text-hover)] before:absolute before:inset-0 before:bg-[var(--sidebar-item-active-bg)] before:-right-2' 
                    : 'text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-item-hover-bg)]'
                  }
                  ${!item.screen && 'opacity-50 cursor-not-allowed'}
                `}
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? 'w-full justify-center' : 'pl-4'}`}>
                  <item.icon size={20} className="relative z-10 shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium relative z-10 truncate">
                      {item.label}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center transition-colors hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-item-hover-bg)] py-3 text-[var(--sidebar-text)]"
        >
          <div className={`flex items-center gap-3 ${isCollapsed ? 'w-full justify-center' : 'pl-4'}`}>
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium truncate">
                Sair
              </span>
            )}
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
