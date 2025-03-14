import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Check,
  Clock,
  FileCheck,
  BookOpen,
  Brain,
  CheckCircle,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../../lib/supabase';
import useAuth from '../../../stores/useAuth';
import { useKnowledgeBases } from '../../../hooks/useKnowledgeBases';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainingId?: string;
  currentPhase?: string;
}

const phaseIcons = {
  aguardando: <Clock size={32} className="text-emerald-500" />,
  recebido: <FileCheck size={32} className="text-emerald-500" />,
  leitura: <BookOpen size={32} className="text-emerald-500" />,
  treinamento: <Brain size={32} className="text-emerald-500" />,
  finalizado: <CheckCircle size={32} className="text-emerald-500" />,
  'recebido erro': <AlertCircle size={32} className="text-red-500" />,
  'leitura erro': <AlertCircle size={32} className="text-red-500" />,
  'treinamento erro': <AlertCircle size={32} className="text-red-500" />,
  'finalizado erro': <AlertCircle size={32} className="text-red-500" />
};

const phaseMessages = {
  aguardando: 'Aguardando o Conteúdo',
  recebido: 'Conteúdo Recebido',
  leitura: 'Leitura Realizada',
  treinamento: 'Treinando o Assistente',
  finalizado: 'Treinamento Realizado',
  'recebido erro': 'Erro no Recebimento',
  'leitura erro': 'Erro na leitura',
  'treinamento erro': 'Erro no treinamento',
  'finalizado erro': 'Erro na finalização'
};

const TrainingModal = ({
  isOpen,
  onClose,
  trainingId,
  currentPhase = 'aguardando'
}: TrainingModalProps) => {
  const { empresaUid } = useAuth();
  const { bases } = useKnowledgeBases();
  const [selectedBase, setSelectedBase] = useState('');
  const [treinoAcao, setTreinoAcao] = useState('Adicionar Treinamento');
  const [treinoFonte, setTreinoFonte] = useState('Treinar por PDF');
  const [url, setUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [phase, setPhase] = useState(currentPhase);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPhase(currentPhase);
      setSelectedFile(null);
      setUploadProgress(0);
      setUploadComplete(false);
      setUrl('');
      setIsUploading(false);
      setSummary('');
      setShowSummary(false);
      setSelectedBase('');
    }
  }, [isOpen, currentPhase]);

  useEffect(() => {
    if (!isOpen || !trainingId) return;

    if (currentPhase) {
      setPhase(currentPhase);
    }

    const channel = supabase.channel(`custom-training-phase-${trainingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conex-treinamentos',
          filter: `uid=eq.${trainingId}`
        },
        (payload) => {
          if (payload.new && 'fase' in payload.new) {
            setPhase(payload.new.fase as string);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [isOpen, trainingId, currentPhase]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf' && file.size <= 40 * 1024 * 1024) {
      setSelectedFile(file);
      setUploadProgress(0);
      simulateUpload();
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 40 * 1024 * 1024,
    multiple: false
  });

  const simulateUpload = () => {
    setUploadProgress(0);
    setUploadComplete(false);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadComplete(true);
          setShowSummary(true);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
    setSummary('');
    setShowSummary(false);
    setUrl('');
  };

  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop();
    const nameWithoutExt = name.slice(0, -(extension?.length || 0) - 1);
    return `${nameWithoutExt.slice(0, maxLength - 3)}...${extension}`;
  };

  const handleSend = async () => {
    if ((!selectedFile && !url) || !trainingId || !empresaUid || !summary.trim() || !selectedBase) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('acao', treinoAcao === 'Adicionar Treinamento' ? 'adicionar' : 'substituir');
      formData.append('baseUid', selectedBase);
      formData.append('treinoUid', trainingId);
      formData.append('empresaUid', empresaUid);
      formData.append('resumo', summary.trim());
      formData.append('tipo', treinoFonte);
      
      if (treinoFonte === 'Treinar por PDF') {
        if (!selectedFile) return;
        formData.append('origem', selectedFile.name);
        formData.append('data', selectedFile);

        await fetch('https://webhook.conexcondo.com.br/webhook/cod-treinamentopdf', {
          method: 'POST',
          body: formData
        });
      } else {
        if (!url) return;
        formData.append('origem', url);
        formData.append('url', url);

        await fetch('https://webhook.conexcondo.com.br/webhook/cod-treinamentourl', {
          method: 'POST',
          body: formData
        });
      }
    } catch (err) {
      console.error('Error sending training data:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const shouldShowActionButtons = phase === 'aguardando';
  const shouldShowCloseButton = phase === 'aguardando' || phase === 'finalizado' || phase.includes('erro');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000]"
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-[1001] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-[#1A1D24] rounded-xl shadow-xl overflow-hidden"
            >
              <div className="relative flex flex-col md:flex-row min-h-[650px]">
                {/* Left Side - Form */}
                <div className="flex-1 p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-lg bg-emerald-500/10">
                      <Activity size={32} className="text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      GERENCIAR BASE DE TREINAMENTO
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Base Selection Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Base de Conhecimento:
                      </label>
                      <select
                        value={selectedBase}
                        onChange={(e) => setSelectedBase(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Selecione uma base</option>
                        {bases.map((base) => (
                          <option key={base.uid} value={base.uid}>
                            {base.nome?.split('_')[0] || 'Base sem nome'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ação a ser realizada:
                      </label>
                      <select
                        value={treinoAcao}
                        onChange={(e) => setTreinoAcao(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option>Adicionar Treinamento</option>
                        <option>Substituir Treinamento</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fonte do Treinamento:
                      </label>
                      <select
                        value={treinoFonte}
                        onChange={(e) => setTreinoFonte(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option>Treinar por PDF</option>
                        <option>Treinar por URL</option>
                      </select>
                    </div>

                    {treinoFonte === 'Treinar por URL' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Informe a URL de treinamento
                        </label>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            setUrl(e.target.value);
                            if (e.target.value) {
                              setShowSummary(true);
                            }
                          }}
                          placeholder="https://suaurl.com.br"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    ) : (
                      <div>
                        {!selectedFile ? (
                          <div
                            {...getRootProps()}
                            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                          >
                            <input {...getInputProps()} />
                            <Upload size={32} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-300">
                              {isDragActive
                                ? "Solte o arquivo aqui..."
                                : "Arraste um arquivo PDF ou clique para selecionar"}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                              Tamanho máximo: 40MB
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                              <FileText size={24} className="text-emerald-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">
                                  {truncateFileName(selectedFile.name)}
                                </p>
                                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                                  <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              </div>
                              {uploadComplete && (
                                <Check size={24} className="text-emerald-500" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {showSummary && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Resumo do Conteúdo
                        </label>
                        <textarea
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          placeholder="Descreva brevemente o conteúdo que está sendo enviado..."
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-16"
                          required
                        />
                      </div>
                    )}

                    {shouldShowActionButtons && (
                      <div className="flex gap-8">
                        <button
                          onClick={handleCancel}
                          disabled={isUploading}
                          className="flex-1 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSend}
                          disabled={isUploading || !summary.trim() || (!selectedFile && !url) || !selectedBase}
                          className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? 'Enviando...' : 'Enviar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Progress */}
                <div className="flex-1 bg-emerald-900/20 p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-lg bg-emerald-500/10">
                      <Activity size={32} className="text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      ACOMPANHE O PROGRESSO
                    </h2>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center h-[calc(100%-6rem)]">
                    <h3 className="text-xl font-bold text-white mb-8">
                      PROGRESSO
                    </h3>
                    {phaseIcons[phase as keyof typeof phaseIcons] || phaseIcons.aguardando}
                    <p className={`text-lg mt-6 mb-2 ${phase.includes('erro') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {phaseMessages[phase as keyof typeof phaseMessages] || phaseMessages.aguardando}
                    </p>
                    <p className="text-gray-400">
                      fase: {phase}
                    </p>

                    {shouldShowCloseButton && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="mt-8 px-8 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Fechar
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TrainingModal;
