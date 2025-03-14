import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Lead } from '../../../../hooks/useLeads';
import { useConversas } from '../../../../hooks/useConversas';
import { ChatMessage } from './ChatMessage';

interface LeadChatContainerProps {
  lead: Lead;
  onBack: () => void;
}

export const LeadChatContainer: React.FC<LeadChatContainerProps> = ({ lead, onBack }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { conversas, loading, error } = useConversas(lead.lead_whatsapp);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    setSending(true);
    // TODO: Implementar envio da mensagem
    setSending(false);
    setInputMessage('');
  };

  return (
    <div 
      className="rounded-lg overflow-hidden flex flex-col" 
      style={{ 
        backgroundColor: 'var(--sidebar-bg)',
        height: 'calc(100vh - 160px)',
        marginBottom: '1.5rem'
      }}
    >
      {/* Header do Chat */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={onBack}
            className="hover:bg-white/10 p-1 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {lead.lead_nome}
          </h2>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {lead.lead_whatsapp?.split('@')[0]}
        </p>
      </div>

      {/* Área de Mensagens */}
      <div 
        className="flex-1 overflow-y-auto p-4"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-primary)' }} />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-red-500">
            Erro ao carregar mensagens: {error}
          </div>
        ) : conversas.length === 0 ? (
          <div className="flex justify-center items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Nenhuma mensagem encontrada
          </div>
        ) : (
          <div className="space-y-4">
            {conversas.map((message) => (
              <ChatMessage
                key={message.uid}
                message={message}
                lead={lead}
                isBot={message.origem === 'Assistente'}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Área de Input */}
      <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Em breve"
            className="flex-1 bg-transparent border border-[var(--border-color)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-[var(--text-primary)]"
            disabled
          />
          <button
            type="submit"
            disabled={true}
            className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
          >
            {sending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeadChatContainer;
