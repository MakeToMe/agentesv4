import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface LeadStatusProps {
  status: 'Pendente' | 'Atendido';
  onStatusChange: (newStatus: 'Pendente' | 'Atendido') => void;
}

const LeadStatus: React.FC<LeadStatusProps> = ({ status, onStatusChange }) => {
  const toggleStatus = () => {
    onStatusChange(status === 'Pendente' ? 'Atendido' : 'Pendente');
  };

  return (
    <button
      onClick={toggleStatus}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
        ${status === 'Atendido' 
          ? 'bg-[var(--status-success-bg)] text-[var(--status-success-color)] hover:bg-[var(--status-success-bg)]' 
          : 'bg-[var(--status-warning-bg)] text-[var(--status-warning-color)] hover:bg-[var(--status-warning-bg)]'
        }
      `}
    >
      {status === 'Atendido' ? (
        <>
          <CheckCircle size={16} />
          Atendido
        </>
      ) : (
        <>
          <Clock size={16} />
          Pendente
        </>
      )}
    </button>
  );
};

export default LeadStatus;
