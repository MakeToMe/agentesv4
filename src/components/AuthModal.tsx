import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import useAuthModal from '../hooks/useAuthModal';
import useAuth from '../stores/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthModal = () => {
  const { isOpen, closeModal, view, setView } = useAuthModal();
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
  const [signupData, setSignupData] = useState({
    cnpj: '',
    email: '',
    whatsapp: '',
    nome: '',     // Nome do usuário
    senha: '',    // Senha do usuário
    empresaNome: '', // Nome da empresa retornado pela API
  });
  const [showSignupConfirmation, setShowSignupConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
    setSuccessMessage('');
    setShowTokenInput(false);
    setToken(['', '', '', '', '', '']);
    setShowSignupConfirmation(false);
    setSignupData({
      cnpj: '',
      email: '',
      whatsapp: '',
      nome: '',
      senha: '',
      empresaNome: ''
    });
  };

  const handleViewChange = (newView: 'login' | 'signup') => {
    handleReset(); // Limpa o formulário ao trocar de view
    setView(newView);
    setSignupData({ cnpj: '', email: '', whatsapp: '', nome: '', senha: '', empresaNome: '' }); // Reset signup data
  };

  const handleSignupInputChange = (field: keyof typeof signupData, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const isSignupValid = () => {
    if (showSignupConfirmation) {
      // Validação dos campos da tela de confirmação
      return (
        signupData.whatsapp.replace(/\D/g, '').length === 11 &&
        signupData.nome.trim() !== '' &&
        signupData.senha.trim() !== ''
      );
    }
    // Validação inicial (apenas CNPJ e email)
    return (
      signupData.cnpj.replace(/\D/g, '').length === 14 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)
    );
  };

  const handleSignupSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('https://webhook.conexcondo.com.br/webhook/validar_cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cnpj: signupData.cnpj.replace(/\D/g, ''),
          email: signupData.email,
        }),
      });

      const data = await response.json();

      if (data.acao === 'cadastroEmpresa') {
        if (data.status === 'ok') {
          // Limpar os campos do formulário de confirmação, mantendo apenas os dados da empresa
          setSignupData(prev => ({
            ...prev,
            empresaNome: data.empresaNome,
            whatsapp: '',
            nome: '',
            senha: ''
          }));
          setShowSignupConfirmation(true);
        } else if (data.status === 'cnpjInvalido') {
          setError('CNPJ inválido. Por favor, verifique e tente novamente.');
        } else {
          setError('Erro ao iniciar cadastro. Por favor, tente novamente.');
        }
      } else {
        setError('Resposta inválida do servidor. Por favor, tente novamente.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupConfirmation = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('https://webhook.conexcondo.com.br/webhook/validar_cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acao: 'concluir',
          empresaCnpj: signupData.cnpj.replace(/\D/g, ''),
          whatsapp: signupData.whatsapp.replace(/\D/g, ''),
          nome: signupData.nome,
          senha: signupData.senha
        }),
      });

      const data = await response.json();
      
      if (data.user === 'criado') {
        // Sucesso: usuário criado
        handleReset(); // Limpa o formulário
        setShowSignupConfirmation(false); // Reseta o estado de confirmação
        setView('login'); // Muda para a view de login
        setSuccessMessage('Cadastro realizado com sucesso! Digite seu WhatsApp ou e-mail para entrar.'); // Mensagem de sucesso
      } else if (data.user === 'erro') {
        // Erro retornado pelo backend
        setError('Não foi possível concluir o cadastro. Por favor, tente novamente.');
      } else {
        // Resposta inesperada
        setError('Erro inesperado. Por favor, tente novamente.');
      }
      
    } catch (err) {
      setError('Erro ao concluir cadastro. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
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
                        {view === 'login' ? (
                          <LogIn className="w-10 h-10 text-emerald-500" />
                        ) : (
                          <UserPlus className="w-10 h-10 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {view === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                      </h2>
                      <p className="mt-2 text-gray-600">
                        {successMessage || (view === 'login'
                          ? 'Digite seu WhatsApp ou e-mail para entrar'
                          : 'Preencha seus dados para começar'
                        )}
                      </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                      {showTokenInput ? (
                        <>
                          <div className="space-y-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">
                                Digite o código de 6 dígitos enviado para seu {isWhatsApp ? 'WhatsApp' : 'e-mail'}
                              </p>
                            </div>

                            {/* Token Input */}
                            <div className="flex justify-center gap-2">
                              {token.map((digit, index) => (
                                <input
                                  key={index}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleTokenChange(index, e.target.value)}
                                  onKeyDown={(e) => handleTokenKeyDown(index, e)}
                                  onPaste={handleTokenPaste}
                                  ref={(el) => (tokenRefs.current[index] = el)}
                                  className="w-12 h-12 text-center border rounded-lg text-lg focus:border-emerald-500 
                                           focus:ring-1 focus:ring-emerald-500 outline-none text-gray-900"
                                />
                              ))}
                            </div>

                            {error && (
                              <p className="text-sm text-red-500 text-center">{error}</p>
                            )}

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
                              className="w-full text-sm text-gray-500 hover:text-gray-700"
                            >
                              Voltar
                            </button>
                          </div>
                        </>
                      ) : view === 'login' ? (
                        <>
                          {/* Input Type Selector */}
                          <div className="flex rounded-lg p-1 bg-gray-100">
                            <button
                              onClick={() => setIsWhatsApp(true)}
                              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors
                                ${isWhatsApp
                                  ? 'bg-white text-gray-900 shadow'
                                  : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                              WhatsApp
                            </button>
                            <button
                              onClick={() => setIsWhatsApp(false)}
                              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors
                                ${!isWhatsApp
                                  ? 'bg-white text-gray-900 shadow'
                                  : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                              E-mail
                            </button>
                          </div>

                          {/* Input Field */}
                          <div>
                            {isWhatsApp ? (
                              <IMaskInput
                                mask="(00) 00000-0000"
                                value={inputValue}
                                onChange={(e: any) => {
                                  setInputValue(e.target.value);
                                  setError('');
                                }}
                                placeholder="(00) 00000-0000"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 
                                         focus:border-emerald-500 outline-none text-gray-900"
                              />
                            ) : (
                              <input
                                type="email"
                                value={inputValue}
                                onChange={(e) => {
                                  setInputValue(e.target.value);
                                  setError('');
                                }}
                                placeholder="seu@email.com"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 
                                         focus:border-emerald-500 outline-none text-gray-900"
                              />
                            )}
                          </div>

                          {error && (
                            <p className="text-sm text-red-500">{error}</p>
                          )}

                          {/* Submit Button */}
                          <div className="space-y-4">
                            <button
                              onClick={handleSubmit}
                              disabled={!isValidInput() || isLoading}
                              className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                                       transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? 'Enviando...' : 'Confirmar'}
                            </button>
                          </div>
                        </>
                      ) : showSignupConfirmation ? (
                        // Tela de Confirmação de Cadastro
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        >
                          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                              <h2 className="text-2xl font-semibold text-gray-900">Complete seu Cadastro</h2>
                              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                              </button>
                            </div>

                            <div className="space-y-4">
                              {/* Dados da empresa */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Empresa</p>
                                <p className="text-lg font-medium text-gray-900">{signupData.empresaNome}</p>
                                <p className="text-sm text-gray-600 mt-2">CNPJ</p>
                                <p className="text-lg font-medium text-gray-900">
                                  {signupData.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
                                </p>
                              </div>

                              {/* Formulário de dados do usuário */}
                              <div className="space-y-3">
                                {/* WhatsApp */}
                                <div>
                                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                                    WhatsApp
                                  </label>
                                  <IMaskInput
                                    id="whatsapp"
                                    mask="(00) 00000-0000"
                                    value={signupData.whatsapp}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                      handleSignupInputChange('whatsapp', e.target.value)
                                    }
                                    placeholder="(00) 00000-0000"
                                    autoComplete="off"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 
                                             focus:border-emerald-500 outline-none text-gray-900"
                                  />
                                </div>

                                <div>
                                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                                    Seu Nome
                                  </label>
                                  <input
                                    type="text"
                                    id="nome"
                                    value={signupData.nome}
                                    onChange={(e) => handleSignupInputChange('nome', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 
                                             focus:border-emerald-500 outline-none text-gray-900"
                                    placeholder="Digite seu nome completo"
                                    autoComplete="off"
                                  />
                                </div>

                                <div>
                                  <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                                    Senha
                                  </label>
                                  <input
                                    type="password"
                                    id="senha"
                                    value={signupData.senha}
                                    onChange={(e) => handleSignupInputChange('senha', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 
                                             focus:border-emerald-500 outline-none text-gray-900"
                                    placeholder="Crie uma senha segura"
                                    autoComplete="new-password"
                                  />
                                </div>
                              </div>

                              {error && (
                                <p className="text-sm text-red-500 mt-2">{error}</p>
                              )}

                              <button
                                onClick={handleSignupConfirmation}
                                disabled={!isSignupValid() || isLoading}
                                className={`w-full py-2 px-4 rounded-lg text-white font-medium
                                          ${isSignupValid() && !isLoading
                                            ? 'bg-emerald-500 hover:bg-emerald-600'
                                            : 'bg-gray-300 cursor-not-allowed'}`}
                              >
                                {isLoading ? (
                                  <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Concluindo...
                                  </span>
                                ) : (
                                  'Concluir Cadastro'
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        // Signup Form
                        <div className="space-y-4">
                          {/* CNPJ */}
                          <div>
                            <IMaskInput
                              type="text"
                              mask="00.000.000/0000-00"
                              value={signupData.cnpj}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleSignupInputChange('cnpj', e.target.value)
                              }
                              placeholder="CNPJ"
                              className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 
                                       focus:border-emerald-500 outline-none text-gray-900"
                            />
                          </div>

                          {/* Email */}
                          <div>
                            <input
                              type="email"
                              value={signupData.email}
                              onChange={(e) => handleSignupInputChange('email', e.target.value)}
                              placeholder="E-mail"
                              className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 
                                       focus:border-emerald-500 outline-none text-gray-900"
                            />
                          </div>

                          {error && (
                            <p className="text-sm text-red-500">{error}</p>
                          )}

                          <button
                            onClick={handleSignupSubmit}
                            disabled={!isSignupValid() || isLoading}
                            className={`w-full py-2 px-4 rounded-lg text-white font-medium
                                      ${isSignupValid() && !isLoading
                                        ? 'bg-emerald-500 hover:bg-emerald-600'
                                        : 'bg-gray-300 cursor-not-allowed'}`}
                          >
                            {isLoading ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Validando...
                              </span>
                            ) : (
                              'Validar CNPJ'
                            )}
                          </button>
                        </div>
                      )}

                      {/* Footer */}
                      {!showTokenInput && (
                        <p className="text-sm text-center text-gray-600">
                          {view === 'login' ? (
                            <>
                              Ainda não tem conta?{' '}
                              <button 
                                onClick={() => handleViewChange('signup')}
                                className="text-emerald-500 hover:text-emerald-600 font-medium"
                              >
                                Cadastre-se agora!
                              </button>
                            </>
                          ) : (
                            <>
                              Já tem uma conta?{' '}
                              <button 
                                onClick={() => handleViewChange('login')}
                                className="text-emerald-500 hover:text-emerald-600 font-medium"
                              >
                                Faça login
                              </button>
                            </>
                          )}
                        </p>
                      )}
                    </div>
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
