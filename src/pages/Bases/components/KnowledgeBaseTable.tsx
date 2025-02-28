import React, { useState, useEffect } from 'react';
import { Database, Eye, Trash2, ChevronLeft, ChevronRight, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { KnowledgeBase } from '../../../hooks/useKnowledgeBases';
import { useProjectNames } from '../../../hooks/useProjectNames';
import { ViewType } from '../types';

const ITEMS_PER_PAGE = 6;

interface KnowledgeBaseTableProps {
  bases: KnowledgeBase[];
  viewType: ViewType;
  onView?: (base: KnowledgeBase) => void;
  onDeleteBase?: (base: KnowledgeBase) => void;
  onAddBase?: (name: string, projectId: string) => Promise<string>;
  onPersonalizar?: (base: KnowledgeBase) => void;
  onUpdateTipo?: (base: KnowledgeBase, tipo: string) => void;
  onUpdateLgpd?: (base: KnowledgeBase, lgpd: boolean) => void;
}

const TipoSelect = ({ base, onUpdateTipo }: { base: KnowledgeBase; onUpdateTipo?: (base: KnowledgeBase, tipo: string) => void }) => (
  <select
    value={base.tipo || 'RAG'}
    onChange={(e) => onUpdateTipo?.(base, e.target.value)}
    className="bg-transparent border border-gray-600 rounded-lg px-2 py-1 text-sm"
    style={{ 
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      cursor: 'pointer'
    }}
  >
    <option value="RAG">RAG</option>
    <option value="SDR">SDR</option>
  </select>
);

const LgpdToggle = ({ base, onUpdateLgpd }: { base: KnowledgeBase; onUpdateLgpd?: (base: KnowledgeBase, lgpd: boolean) => void }) => {
  // Estado local para evitar flash
  const [isChecked, setIsChecked] = useState(base.lgpd ?? false);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onUpdateLgpd?.(base, newValue);
  };

  // Atualiza estado local quando o valor da prop muda
  useEffect(() => {
    if (base.lgpd !== undefined && base.lgpd !== isChecked) {
      setIsChecked(base.lgpd);
    }
  }, [base.lgpd]);

  return (
    <button
      onClick={handleToggle}
      className="relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
      style={{ 
        backgroundColor: isChecked ? '#10b981' : 'var(--bg-secondary)',
        borderWidth: '1px',
        borderColor: isChecked ? '#10b981' : 'var(--border-color)'
      }}
    >
      <span className="sr-only">Toggle LGPD</span>
      <div
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out"
        style={{ 
          transform: `translateX(${isChecked ? '16px' : '2px'})`,
          backgroundColor: '#fff'
        }}
      />
    </button>
  );
};

const KnowledgeBaseTable: React.FC<KnowledgeBaseTableProps> = ({
  bases,
  viewType,
  onView,
  onDeleteBase,
  onAddBase,
  onPersonalizar,
  onUpdateTipo,
  onUpdateLgpd,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState(currentPage.toString());

  const projectIds = [...new Set(bases.map(base => base.projeto).filter((id): id is string => id !== null))];

  const { projectNames } = useProjectNames(projectIds);

  // Calcula o total de páginas
  const totalPages = Math.ceil(bases.length / ITEMS_PER_PAGE);

  // Obtém as bases da página atual
  const currentBases = bases.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy, HH:mm", { locale: ptBR });
  };

  // Handler para mudança de página via input
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  // Handler para submissão da página via input
  const handlePageInputSubmit = () => {
    const pageNumber = parseInt(inputPage);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    } else {
      setInputPage(currentPage.toString());
    }
  };

  // Handler para navegação via botão
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setInputPage(page.toString());
    }
  };

  if (viewType === 'grid') {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentBases.map((base) => (
            <div 
              key={base.uid} 
              className="p-4 rounded-lg flex flex-col h-full"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-5 h-5 text-emerald-500" />
                  <span className="text-[var(--text-primary)] font-medium">{base.nome ? base.nome.split('_')[0] : '-'}</span>
                </div>
                
                <div className="border-t border-gray-700/50 pt-4 space-y-2">
                  <div>
                    <span className="text-[var(--text-secondary)] text-sm">Tipo:</span>
                    <div className="mt-1">
                      <TipoSelect base={base} onUpdateTipo={onUpdateTipo} />
                    </div>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] text-sm">LGPD:</span>
                    <div className="mt-1">
                      <LgpdToggle base={base} onUpdateLgpd={onUpdateLgpd} />
                    </div>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] text-sm">Criada em:</span>
                    <div className="text-[var(--text-primary)]">
                      {base.created_at ? formatDate(base.created_at) : '-'}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[var(--text-secondary)] text-sm">Projeto:</span>
                    <div className="text-[var(--text-primary)]">
                      {base.projeto ? projectNames[base.projeto] || '-' : '-'}
                    </div>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] text-sm">Treinamentos:</span>
                    <div className="text-[var(--text-primary)]">{base.treinamentos_qtd || 0}</div>
                  </div>

                  {base.treinamentos && base.treinamentos.length > 0 && (
                    <div>
                      <span className="text-[var(--text-secondary)] text-sm">Conteúdos:</span>
                      <div className="space-y-1 mt-1">
                        {base.treinamentos.slice(0, 2).map((treinamento, index) => (
                          <div key={index} className="text-[var(--text-primary)] text-sm truncate">
                            {treinamento}
                          </div>
                        ))}
                        {base.treinamentos.length > 2 && (
                          <div className="text-emerald-500 text-sm">
                            (...) Clique em visualizar
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-700/50">
                <button
                  onClick={() => onView?.(base)}
                  className="flex flex-col items-center"
                >
                  <div className="p-2 rounded-lg shadow-lg bg-emerald-500/10">
                    <Eye className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-xs text-emerald-500 mt-1">ver</span>
                </button>
                <button
                  onClick={() => onPersonalizar?.(base)}
                  className="flex flex-col items-center"
                >
                  <div className="p-2 rounded-lg shadow-lg bg-emerald-500/10">
                    <Bot className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-xs text-emerald-500 mt-1">personalizar</span>
                </button>
                <button
                  onClick={() => onDeleteBase?.(base)}
                  className="flex flex-col items-center"
                >
                  <div className="p-2 rounded-lg shadow-lg bg-red-500/10">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-xs text-red-500 mt-1">excluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Paginação */}
        {bases.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <ChevronLeft className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
                </button>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputPage}
                  onChange={handlePageInputChange}
                  onBlur={handlePageInputSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handlePageInputSubmit()}
                  className="h-8 w-12 rounded-lg border border-gray-600 text-center text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>de {totalPages}</span>
              </div>
              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <ChevronRight className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--table-header-bg)' }}>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Nome</th>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Criada</th>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Projeto</th>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Treinamentos</th>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Conteúdos</th>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Tipo</th>
            <th className="text-left py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>LGPD</th>
            <th className="text-center py-4 px-4 font-medium" style={{ color: 'var(--text-secondary)', width: '280px' }}>Gestão</th>
          </tr>
        </thead>
        <tbody>
          {currentBases.map((base) => (
            <tr
              key={base.uid}
              className="border-b"
              style={{ 
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                transition: 'background-color 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              }}
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-emerald-500" />
                  <span style={{ color: 'var(--text-primary)' }}>{base.nome ? base.nome.split('_')[0] : '-'}</span>
                </div>
              </td>
              <td className="py-4 px-4" style={{ color: 'var(--text-secondary)' }}>
                {base.created_at ? formatDate(base.created_at) : '-'}
              </td>
              <td className="py-4 px-4" style={{ color: 'var(--text-secondary)' }}>
                {base.projeto ? projectNames[base.projeto] || '-' : '-'}
              </td>
              <td className="py-4 px-4" style={{ color: 'var(--text-secondary)' }}>
                {base.treinamentos_qtd || 0}
              </td>
              <td className="py-4 px-4">
                {base.treinamentos && base.treinamentos.length > 0 ? (
                  <div className="space-y-1">
                    {base.treinamentos.slice(0, 3).map((treinamento, index) => (
                      <div key={index} style={{ color: 'var(--text-secondary)' }}>
                        {treinamento}
                      </div>
                    ))}
                    {base.treinamentos.length > 3 && (
                      <div className="text-emerald-500 text-sm">
                        (...) Clique em visualizar
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>-</span>
                )}
              </td>
              <td className="py-4 px-4">
                <TipoSelect base={base} onUpdateTipo={onUpdateTipo} />
              </td>
              <td className="py-4 px-4">
                <LgpdToggle base={base} onUpdateLgpd={onUpdateLgpd} />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => onView?.(base)}
                      className="flex items-center justify-center rounded-lg p-2"
                      style={{ backgroundColor: 'rgba(0, 209, 157, 0.1)' }}
                    >
                      <Eye className="h-5 w-5" style={{ color: '#00D19D' }} />
                    </button>
                    <span className="mt-1 text-xs" style={{ color: '#00D19D' }}>
                      ver
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => onPersonalizar?.(base)}
                      className="flex items-center justify-center rounded-lg p-2"
                      style={{ backgroundColor: 'rgba(0, 209, 157, 0.1)' }}
                    >
                      <Bot className="h-5 w-5" style={{ color: '#00D19D' }} />
                    </button>
                    <span className="mt-1 text-xs" style={{ color: '#00D19D' }}>
                      personalizar
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => onDeleteBase?.(base)}
                      className="flex items-center justify-center rounded-lg p-2"
                      style={{ backgroundColor: 'rgba(255, 71, 87, 0.1)' }}
                    >
                      <Trash2 className="h-5 w-5" style={{ color: '#FF4757' }} />
                    </button>
                    <span className="mt-1 text-xs" style={{ color: '#FF4757' }}>
                      excluir
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      {bases.length > ITEMS_PER_PAGE && (
        <div className="mt-4 flex items-center justify-center gap-2 py-3">
          {currentPage > 1 && (
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <ChevronLeft className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputPage}
              onChange={handlePageInputChange}
              onBlur={handlePageInputSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handlePageInputSubmit()}
              className="h-8 w-12 rounded-lg border border-gray-600 text-center text-sm"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>de {totalPages}</span>
          </div>
          {currentPage < totalPages && (
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <ChevronRight className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseTable;
