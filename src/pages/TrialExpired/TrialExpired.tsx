import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CreditCard } from 'lucide-react';

const TrialExpired: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-red-100 mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Seu período de trial expirou</h1>
          <p className="text-gray-600">
            Obrigado por experimentar nossa plataforma! Para continuar utilizando todos os recursos, 
            é necessário assinar um de nossos planos.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="font-semibold text-gray-800 mb-2">Benefícios da assinatura:</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">✓</span>
              <span>Acesso ilimitado a todas as funcionalidades</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">✓</span>
              <span>Suporte prioritário</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">✓</span>
              <span>Atualizações e novos recursos</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">✓</span>
              <span>Sem limitações de uso</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.href = 'https://conexcondo.com.br/planos'}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center justify-center"
          >
            <CreditCard size={20} className="mr-2" />
            Assinar um plano
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Voltar para a página inicial
          </button>
        </div>

        <p className="text-sm text-center text-gray-500 mt-6">
          Dúvidas? Entre em contato com nosso suporte pelo WhatsApp
          <a 
            href="https://wa.me/5511999999999" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-500 hover:text-emerald-600 ml-1"
          >
            (11) 99999-9999
          </a>
        </p>
      </div>
    </div>
  );
};

export default TrialExpired;
