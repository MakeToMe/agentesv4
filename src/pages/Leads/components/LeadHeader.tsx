import React from 'react';
import { LayoutGrid, Table, Users } from 'lucide-react';

interface LeadHeaderProps {
  viewType: 'grid' | 'table';
  onViewTypeChange: (type: 'grid' | 'table') => void;
}

const LeadHeader: React.FC<LeadHeaderProps> = ({
  viewType,
  onViewTypeChange,
}) => {
  return (
    <div className="flex justify-between items-center bg-[var(--bg-primary)] rounded-lg h-[72px] py-0 px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-[var(--accent-color)]" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Leads
          </h2>
        </div>

        <div 
          className="flex items-center gap-2 p-1 rounded-lg" 
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <button
            onClick={() => onViewTypeChange('table')}
            className="p-2 rounded-lg transition-all"
            style={{ 
              backgroundColor: viewType === 'table' ? 'var(--bg-primary)' : 'transparent',
              color: viewType === 'table' ? 'var(--accent-color)' : 'var(--text-secondary)',
              boxShadow: viewType === 'table' ? 'var(--shadow-elevation-low)' : 'none',
              border: viewType === 'table' ? '1px solid var(--border-color)' : 'none'
            }}
          >
            <Table className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewTypeChange('grid')}
            className="p-2 rounded-lg transition-all"
            style={{ 
              backgroundColor: viewType === 'grid' ? 'var(--bg-primary)' : 'transparent',
              color: viewType === 'grid' ? 'var(--accent-color)' : 'var(--text-secondary)',
              boxShadow: viewType === 'grid' ? 'var(--shadow-elevation-low)' : 'none',
              border: viewType === 'grid' ? '1px solid var(--border-color)' : 'none'
            }}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadHeader;
