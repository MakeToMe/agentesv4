import React from 'react';
import { Bot } from 'lucide-react';
import { Conversa } from '../../../../hooks/useConversas';
import { Lead } from '../../../../hooks/useLeads';

interface ChatMessageProps {
  message: Conversa;
  lead: Lead;
  isBot: boolean;
}

const formatMessage = (text: string | null) => {
  if (!text) return '';
  // Primeiro substitui a string literal '\n' por quebra de linha real
  const textWithLineBreaks = text.replace(/\\n/g, '\n');
  // Depois divide por quebras de linha e adiciona <br />
  return textWithLineBreaks
    .split('\n')
    .map((line, i, arr) => (
      <React.Fragment key={i}>
        {line.trim()}
        {i !== arr.length - 1 && <br />}
      </React.Fragment>
    ));
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, lead, isBot }) => {
  return (
    <div className={`flex items-start gap-2 ${isBot ? '' : 'justify-end'}`}>
      {isBot ? (
        <>
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div 
            className="rounded-lg p-3 max-w-[80%]"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="whitespace-pre-wrap break-words">{formatMessage(message.mensagem)}</div>
            <span className="text-xs mt-1 block" style={{ color: 'var(--text-secondary)' }}>
              {new Date(message.created_at).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </>
      ) : (
        <>
          <div 
            className="rounded-lg p-3 max-w-[80%] bg-emerald-500 text-white"
          >
            <div className="whitespace-pre-wrap break-words">{formatMessage(message.mensagem)}</div>
            <span className="text-xs mt-1 block text-white/80">
              {new Date(message.created_at).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={lead.lead_perfil || ''}
              alt={lead.lead_nome || 'Perfil'}
              className="w-full h-full object-cover"
            />
          </div>
        </>
      )}
    </div>
  );
};
