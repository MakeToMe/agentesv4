import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import useAuthModal from '../hooks/useAuthModal';
import useAuth from '../stores/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthModal = () => {
  const { isOpen, closeModal } = useAuthModal();
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [isWhatsApp, setIsWhatsApp] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [token, setToken] = useState(['', '', '', '', '', '']);
  const [userData, setUserData] = useState<{
    empresaUid: string;
    userUid: string;
    userNome: string;
    whatsapp: string;
  } | null>(null);
  const tokenRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleTokenChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    const newToken = [...token];
    newToken[index] = value;
    setToken(newToken);

    // Move to next input if value is entered
    if (value && index < 5) {
      tokenRefs.current[index + 1]?.focus();
    }
  };

  const handleTokenKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !token[index] && index > 0) {
      tokenRefs.current[index - 1]?.focus();
    }
  };

  const handleTokenPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newToken = [...token];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) {
        newToken[i] = pastedData[i];
      }
    }
    
    setToken(newToken);
  };

  const isValidInput = () => {
    if (isWhatsApp) {
      return inputValue.replace(/\D/g, '').length === 11;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue);
  };

  const handleSubmit = async () => {
    if (showTokenInput) {
      if (token.some(t => !t)) return;
      
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('https://webhook.conexcondo.com.br/webhook/login-challenge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            acao: 'login',
            token: token.join(''),
            userId: userData?.userUid,
          }),
        });

        const data = await response.json();
        
        if (data.status === 'valido') {
          // Armazena os dados de autenticação
          setAuth(data.userId, data.empresaId, {
            user_nome: userData?.userNome,
            user_whatsApp: userData?.whatsapp,
          });
          
          // Fecha o modal e navega para o dashboard
          closeModal();
          navigate('/dashboard');
        } else if (data.status === 'invalido') {
          setError('Código inválido. Por favor, tente novamente.');
          setToken(['', '', '', '', '', '']); // Limpa os inputs
          tokenRefs.current[0]?.focus(); // Foca no primeiro input
        }
        
      } catch (error) {
        setError('Erro ao validar código. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!isValidInput()) return;
      
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('https://webhook.conexcondo.com.br/webhook/login-challenge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            acao: 'validarWpp',
            whatsapp: inputValue.replace(/\D/g, ''),
          }),
        });

        const data = await response.json();
        
        if (data.status === 'autorizado') {
          setUserData({
            ...data,
            whatsapp: inputValue
          });
          setShowTokenInput(true);
        } else if (data.status === 'inexistente') {
          setError('WhatsApp não encontrado');
        }
        
      } catch (error) {
        setError('Erro ao validar WhatsApp. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    setInputValue('');
    setError('');
    setShowTokenInput(false);
    setToken(['', '', '', '', '', '']);
    setUserData(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-[900px] bg-white rounded-xl overflow-hidden shadow-xl"
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>

              {/* Content */}
              <div className="flex">
                {/* Left Side - Image */}
                <div className="hidden md:block w-1/2 relative">
                  <img
                    src="https://s3.conexcondo.com.br/fmg/conex-login-signup-flavio-guardia.png"
                    alt="Login"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                  <div className="space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-50/50 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="11" stroke="#10B981" strokeWidth="2"/>
                          <circle cx="12" cy="8" r="4" stroke="#10B981" strokeWidth="2"/>
                          <path d="M4 19C4 16 8 14 12 14C16 14 20 16 20 19" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>

                    {showTokenInput ? (
                      <>
                        <div className="text-center">
                          <p className="text-gray-600">
                            Digite o código enviado para {userData?.whatsapp}
                          </p>
                        </div>

                        <div className="flex justify-center gap-2">
                          {token.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => (tokenRefs.current[index] = el)}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleTokenChange(index, e.target.value)}
                              onKeyDown={(e) => handleTokenKeyDown(index, e)}
                              onPaste={handleTokenPaste}
                              className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg font-semibold
                                     focus:ring-2 focus:ring-emerald-500 focus:border-transparent !text-gray-900"
                            />
                          ))}
                        </div>

                        <div className="space-y-3">
                          <button 
                            onClick={handleSubmit}
                            disabled={token.some(t => !t) || isLoading}
                            className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                                     transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Validando...' : 'Confirmar'}
                          </button>

                          <button 
                            onClick={handleReset}
                            className="w-full py-2 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 
                                     transition-colors font-medium"
                          >
                            Recomeçar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Title */}
                        <div className="text-center space-y-2">
                          <h2 className="text-2xl font-bold">
                            Fazer Login
                          </h2>
                          <p className="text-gray-600">
                            Escolha como deseja se conectar:
                          </p>
                        </div>

                        {/* Tabs */}
                        <div className="bg-gray-100 p-1 rounded-lg inline-flex w-full">
                          <button 
                            onClick={() => {
                              setIsWhatsApp(true);
                              setInputValue('');
                            }}
                            className={`flex-1 px-4 py-2 rounded-md transition-all ${
                              isWhatsApp ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                            }`}
                          >
                            WhatsApp
                          </button>
                          <button 
                            onClick={() => {
                              setIsWhatsApp(false);
                              setInputValue('');
                            }}
                            className={`flex-1 px-4 py-2 rounded-md transition-all ${
                              !isWhatsApp ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                            }`}
                          >
                            E-mail
                          </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {isWhatsApp ? 'WhatsApp' : 'E-mail'}
                            </label>
                            {isWhatsApp ? (
                              <IMaskInput
                                mask="(00) 00000-0000"
                                placeholder="(00) 00000-0000"
                                value={inputValue}
                                onAccept={(value: string) => setInputValue(value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent !text-gray-900"
                              />
                            ) : (
                              <input
                                type="email"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Digite seu e-mail"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent !text-gray-900"
                              />
                            )}
                          </div>

                          {error && (
                            <div className="text-center">
                              <p className="text-red-500 text-sm">{error}</p>
                              <button
                                onClick={handleReset}
                                className="mt-2 text-sm text-emerald-500 hover:text-emerald-600"
                              >
                                Tentar novamente
                              </button>
                            </div>
                          )}

                          <button 
                            onClick={handleSubmit}
                            disabled={!isValidInput() || isLoading}
                            className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                                     transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Enviando...' : 'Confirmar'}
                          </button>
                        </div>

                        {/* Footer */}
                        <p className="text-sm text-center text-gray-600">
                          Ainda não tem conta?{' '}
                          <button className="text-emerald-500 hover:text-emerald-600 font-medium">
                            Cadastre-se agora!
                          </button>
                        </p>
                      </>
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

export default AuthModal;
