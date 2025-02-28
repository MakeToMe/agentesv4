import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import useAuthModal from '../hooks/useAuthModal';
import useAuth from '../stores/useAuth';
import { useNavigate } from 'react-router-dom';
import { validateCnpj } from '../services/cnpjService';

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
  const [password, setPassword] = useState('');
  
  // Estados para o cadastro
  const [cadastroView, setCadastroView] = useState<'validateCnpj' | 'completeSignup' | 'success' | null>(null);
  const [cnpj, setCnpj] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [signupFormData, setSignupFormData] = useState({
    usuario: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    whatsapp: '',
    empresa: '',
    fantasia: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    cnpj: ''
  });

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

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidInput = () => {
    if (showTokenInput) {
      return token.every(t => t !== '');
    }
    
    if (isWhatsApp) {
      // Validar formato de WhatsApp
      const whatsappNumerico = inputValue.replace(/\D/g, '');
      return whatsappNumerico.length >= 10;
    } else {
      // Validar formato de e-mail e senha
      return isValidEmail(inputValue) && password.length >= 6;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showTokenInput) {
      if (token.some(t => !t)) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const tokenValue = token.join('');
        console.log('Verificando token:', tokenValue);
        
        // Simulando uma chamada de API bem-sucedida
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulando um login bem-sucedido
        setAuth('user123', 'empresa456', {
          user_nome: 'Usuário Teste',
          user_whatsApp: '(11) 99999-9999',
        });
        
        closeModal();
        navigate('/dashboard');
      } catch (err) {
        console.error('Erro ao verificar token:', err);
        setError('Token inválido ou expirado');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    if (!isValidInput()) return;
      
    setIsLoading(true);
    setError('');
    
    try {
      if (isWhatsApp) {
        const whatsapp = inputValue;
        console.log('Tentando login com WhatsApp:', whatsapp);
        
        // Simulando uma chamada de API bem-sucedida para WhatsApp
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mostrar tela de token
        setShowTokenInput(true);
      } else {
        const email = inputValue;
        console.log('Tentando login com e-mail:', email, 'e senha:', password);
        
        // Simulando uma chamada de API bem-sucedida para e-mail/senha
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulando um login bem-sucedido
        setAuth('user123', 'empresa456', {
          user_nome: 'Usuário Teste',
          user_whatsApp: '(11) 99999-9999',
        });
        
        closeModal();
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(isWhatsApp ? 'WhatsApp não encontrado' : 'E-mail ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputValue('');
    setError('');
    setShowTokenInput(false);
    setToken(['', '', '', '', '', '']);
    setUserData(null);
  };

  // Funções para o cadastro
  const handleValidateCnpj = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica do CNPJ
    const cnpjNumerico = cnpj.replace(/\D/g, '');
    if (cnpjNumerico.length !== 14) {
      setError('CNPJ deve conter 14 dígitos');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      console.log('Validando CNPJ:', cnpjNumerico);
      
      // Usar o serviço de validação de CNPJ
      const data = await validateCnpj(cnpjNumerico);
      console.log('Resposta da validação de CNPJ:', data);

      // Verificar se o CNPJ é válido
      if (data.status === 'OK') {
        console.log('CNPJ válido, nome da empresa:', data.nome);
        setCompanyName(data.nome);
        setSignupFormData(prev => ({
          ...prev,
          empresa: data.nome,
          fantasia: data.fantasia || data.nome,
          endereco: `${data.logradouro}, ${data.numero}${data.complemento ? ', ' + data.complemento : ''}`,
          bairro: data.bairro,
          cidade: data.municipio,
          estado: data.uf,
          cep: data.cep,
          telefone: data.telefone,
          email: data.email || ''
        }));
        setCadastroView('completeSignup');
      } else {
        console.log('CNPJ inválido ou não encontrado:', data);
        setError('CNPJ não encontrado ou inválido');
      }
    } catch (err) {
      console.error('Erro ao validar CNPJ:', err);
      setError('Erro ao validar CNPJ. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    // Validar dados do formulário
    if (!signupFormData.usuario.trim()) {
      setError('Nome de usuário é obrigatório');
      return;
    }

    if (!signupFormData.email.trim()) {
      setError('E-mail é obrigatório');
      return;
    }

    if (signupFormData.senha.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (signupFormData.senha !== signupFormData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Criando empresa e usuário com os dados:', signupFormData);
      
      // Aqui você faria a chamada para a API para criar a empresa e o usuário
      // Simulando uma chamada de API bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Após o cadastro bem-sucedido, mostrar a tela de sucesso
      setCadastroView('success');
    } catch (err) {
      console.error('Erro ao criar empresa:', err);
      setError('Erro ao criar empresa. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const startCadastro = () => {
    handleReset();
    setCadastroView('validateCnpj');
  };

  const resetCadastro = () => {
    setCadastroView(null);
    setCnpj('');
    setCompanyName('');
    setSignupFormData({
      usuario: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      whatsapp: '',
      empresa: '',
      fantasia: '',
      endereco: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      cnpj: ''
    });
    setError('');
  };

  // Limpar estados quando o modal for fechado
  useEffect(() => {
    if (!isOpen) {
      resetStates();
    }
  }, [isOpen]);

  const resetStates = () => {
    setIsWhatsApp(true);
    setInputValue('');
    setPassword('');
    setShowTokenInput(false);
    setToken(['', '', '', '', '', '']);
    setUserData(null);
    setCadastroView(null);
    setCnpj('');
    setCompanyName('');
    setSignupFormData({
      usuario: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      whatsapp: '',
      empresa: '',
      fantasia: '',
      endereco: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      cnpj: ''
    });
    setError('');
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
              className="relative w-full max-w-[900px] bg-white rounded-xl overflow-hidden shadow-xl max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>

              {/* Content */}
              <div className="flex h-full">
                {/* Left Side - Image */}
                <div className="hidden md:block w-1/2 relative">
                  <img
                    src="https://s3.conexcondo.com.br/fmg/conex-login-signup-flavio-guardia.png"
                    alt="Login"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
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
                    ) : cadastroView === 'validateCnpj' ? (
                      <>
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-gray-900">Cadastre-se</h2>
                          <p className="mt-2 text-gray-600">
                            Informe o CNPJ da sua empresa para começar
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                              CNPJ
                            </label>
                            <IMaskInput
                              id="cnpj"
                              mask="00.000.000/0000-00"
                              value={cnpj}
                              onAccept={(value: string) => setCnpj(value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              placeholder="00.000.000/0000-00"
                            />
                          </div>

                          {error && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-center text-red-600"
                            >
                              {error}
                            </motion.p>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleValidateCnpj}
                            disabled={isLoading || cnpj.replace(/\D/g, '').length !== 14}
                            className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                                    transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Validando...
                              </span>
                            ) : 'Validar CNPJ'}
                          </motion.button>

                          <div className="text-center">
                            <p className="text-sm text-gray-600">
                              Já tem uma conta?{' '}
                              <button
                                onClick={() => setView('login')}
                                className="text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                Faça login
                              </button>
                            </p>
                          </div>
                        </div>
                      </>
                    ) : cadastroView === 'completeSignup' ? (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="text-center mb-6">
                          <h2 className="text-2xl font-bold text-gray-900">Complete seu cadastro</h2>
                        </div>

                        <div className="border-t border-gray-200 my-4 pt-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Dados da empresa</h3>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-700">Dados da empresa</h3>
                          
                          {/* Company Name */}
                          <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                              Nome
                            </label>
                            <input
                              id="companyName"
                              type="text"
                              value={signupFormData.empresa}
                              onChange={(e) => setSignupFormData({ ...signupFormData, empresa: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              readOnly
                            />
                          </div>

                          {/* Hidden fields - will be sent in POST but not visible */}
                          <input type="hidden" value={signupFormData.endereco} />
                          <input type="hidden" value={signupFormData.bairro} />
                          <input type="hidden" value={signupFormData.cidade} />
                          <input type="hidden" value={signupFormData.estado} />
                          <input type="hidden" value={signupFormData.cep} />
                          <input type="hidden" value={signupFormData.telefone} />
                        </div>

                        {/* User Data Section */}
                        <div className="space-y-4 mt-8">
                          <h3 className="text-lg font-semibold text-gray-700 border-t border-gray-200 pt-4">Dados de acesso</h3>

                          {/* Username */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nome de usuário *
                            </label>
                            <input
                              type="text"
                              value={signupFormData.usuario}
                              onChange={(e) => setSignupFormData(prev => ({ ...prev, usuario: e.target.value }))}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent !text-gray-900"
                              required
                            />
                          </div>

                          {/* Email */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              E-mail *
                            </label>
                            <input
                              type="email"
                              value={signupFormData.email}
                              onChange={(e) => setSignupFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent !text-gray-900"
                              required
                            />
                          </div>

                          {/* Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Senha *
                            </label>
                            <input
                              type="password"
                              value={signupFormData.senha}
                              onChange={(e) => setSignupFormData(prev => ({ ...prev, senha: e.target.value }))}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent !text-gray-900"
                              minLength={6}
                              required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Mínimo de 6 caracteres
                            </p>
                          </div>

                          {/* Confirm Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirmar senha *
                            </label>
                            <input
                              type="password"
                              value={signupFormData.confirmarSenha}
                              onChange={(e) => setSignupFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent !text-gray-900"
                              minLength={6}
                              required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Mínimo de 6 caracteres
                            </p>
                          </div>

                          {/* WhatsApp */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              WhatsApp (opcional)
                            </label>
                            <IMaskInput
                              mask="(00) 00000-0000"
                              value={signupFormData.whatsapp}
                              onAccept={(value: string) => setSignupFormData(prev => ({ ...prev, whatsapp: value }))}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent !text-gray-900"
                            />
                          </div>

                          {error && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-center text-red-600"
                            >
                              {error}
                            </motion.p>
                          )}

                          <div className="flex space-x-4 mt-6">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={() => setCadastroView('validateCnpj')}
                              className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 
                                      transition-colors font-medium"
                            >
                              Voltar
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleCreateCompany}
                              disabled={
                                isLoading || 
                                !signupFormData.usuario.trim() || 
                                !signupFormData.email.trim() || 
                                signupFormData.senha.length < 6 ||
                                signupFormData.senha !== signupFormData.confirmarSenha
                              }
                              className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                                      transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? (
                                <div className="flex items-center justify-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Processando...
                                </div>
                              ) : (
                                'Concluir cadastro'
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ) : cadastroView === 'success' ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6 py-4"
                      >
                        <div className="flex justify-center">
                          <div className="rounded-full bg-emerald-100 p-3">
                            <svg className="w-12 h-12 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro concluído com sucesso!</h2>
                          <p className="text-gray-600">
                            Sua empresa <span className="font-medium">{signupFormData.empresa}</span> foi cadastrada com sucesso.
                          </p>
                          <p className="text-gray-600 mt-1">
                            Você já pode acessar o sistema e começar a usar todas as funcionalidades.
                          </p>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            closeModal();
                            navigate('/dashboard');
                          }}
                          className="w-full py-3 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                                  transition-colors font-medium"
                        >
                          Acessar o sistema
                        </motion.button>
                      </motion.div>
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
                        <form onSubmit={handleSubmit}>
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

                          {!isWhatsApp && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Senha
                              </label>
                              <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite sua senha"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent !text-gray-900"
                              />
                            </div>
                          )}

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
                            type="submit"
                            disabled={!isValidInput() || isLoading}
                            className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                                    transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Enviando...' : 'Confirmar'}
                          </button>
                        </form>

                        {/* Footer */}
                        <p className="text-sm text-center text-gray-600">
                          Ainda não tem conta?{' '}
                          <button 
                            onClick={startCadastro}
                            className="text-emerald-500 hover:text-emerald-600 font-medium">
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