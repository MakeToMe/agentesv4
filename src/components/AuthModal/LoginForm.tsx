import React from 'react';
import useAuthModal from '../../hooks/useAuthModal';

const LoginForm = () => {
  const { closeModal, setView } = useAuthModal();

  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-6">
        Entrar na ConexIA
      </h2>
      <p className="text-gray-300 mb-8">
        Faça login para acessar sua conta.
      </p>
      <input 
        type="text" 
        className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 mb-4" 
        placeholder="WhatsApp ou E-mail"
      />
      <button
        onClick={closeModal}
        className="w-full px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 font-semibold"
      >
        Entrar
      </button>
      
      <div className="mt-6 text-center">
        <p className="text-gray-300">
          Não tem conta?{' '}
          <button 
            onClick={() => setView('signup')}
            className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
          >
            Cadastre-se agora!
          </button>
        </p>
      </div>
    </>
  );
};

export default LoginForm;