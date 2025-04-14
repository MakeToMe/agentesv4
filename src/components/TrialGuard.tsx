import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

interface TrialGuardProps {
  children: React.ReactNode;
}

const TrialGuard: React.FC<TrialGuardProps> = ({ children }) => {
  const { userData } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Páginas que sempre serão acessíveis, mesmo com trial expirado
  const publicPaths = ['/', '/login', '/trial-expired'];

  const isTrialExpired = useMemo(() => {
    if (!userData?.created_at) return false; // Se não tiver data, não bloqueia
    
    const createdDate = new Date(userData.created_at);
    const today = new Date();
    
    // Calcula a diferença em milissegundos
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    // Converte para dias
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Trial expirado se passaram mais de 15 dias
    return diffDays > 15;
  }, [userData]);

  useEffect(() => {
    // Verifica se o usuário está em uma rota protegida e se o trial expirou
    const isPublicPath = publicPaths.some(path => location.pathname === path);
    
    if (isTrialExpired && !isPublicPath) {
      navigate('/trial-expired');
    }
  }, [isTrialExpired, location.pathname, navigate]);

  return <>{children}</>;
};

export default TrialGuard;
