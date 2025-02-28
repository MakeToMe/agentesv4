import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../stores/useAuth';
import CNPJTest from '../../components/CNPJTest';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userUid } = useAuth();

  // Se o usuário já estiver logado, redireciona para o dashboard
  React.useEffect(() => {
    if (userUid) {
      navigate('/dashboard');
    }
  }, [userUid, navigate]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Conexia - Gestão de Leads Inteligente</h1>
            <p className="text-xl mb-8">Transforme seus contatos em oportunidades de negócio com nossa plataforma de gestão de leads.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleLoginClick}
                className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Acessar Plataforma
              </button>
              <button 
                onClick={handleSignupClick}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors border border-white"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Teste de CNPJ */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Teste de Validação de CNPJ</h2>
        <CNPJTest />
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Recursos Principais</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Captura Inteligente</h3>
            <p className="text-gray-600">Capture leads de múltiplas fontes e centralize em um único lugar com validação automática de dados.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Automação de Processos</h3>
            <p className="text-gray-600">Automatize o acompanhamento de leads com fluxos de trabalho personalizados e notificações inteligentes.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Análise Avançada</h3>
            <p className="text-gray-600">Obtenha insights valiosos com relatórios detalhados e métricas de desempenho em tempo real.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para transformar seus leads em clientes?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Comece agora mesmo e veja como a Conexia pode impulsionar seus resultados de vendas.</p>
          <button 
            onClick={handleSignupClick}
            className="px-8 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Experimente Grátis
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Conexia</h3>
              <p className="text-gray-400"> {new Date().getFullYear()} Todos os direitos reservados</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-emerald-400 transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
