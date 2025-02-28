import React, { useState } from 'react';
import { validateCnpj } from '../services/cnpjService';
import { IMaskInput } from 'react-imask';

const CNPJTest: React.FC = () => {
  const [cnpj, setCnpj] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

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
    setResult(null);

    try {
      console.log('Validando CNPJ:', cnpjNumerico);
      
      // Usar o serviço de validação de CNPJ
      const data = await validateCnpj(cnpjNumerico);
      console.log('Resposta da validação de CNPJ:', data);
      setResult(data);
    } catch (err) {
      console.error('Erro ao validar CNPJ:', err);
      setError('Erro ao validar CNPJ. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Teste de Validação de CNPJ</h1>
      
      <form onSubmit={handleValidateCnpj} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNPJ
          </label>
          <IMaskInput
            mask="00.000.000/0000-00"
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onAccept={(value: string) => setCnpj(value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Ex: 12.683.283/0001-00
          </p>
        </div>

        {error && (
          <div className="text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <button 
          type="submit"
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
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Resultado:</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Razão Social:</span> {result.nome}</p>
            <p><span className="font-medium">Nome Fantasia:</span> {result.fantasia}</p>
            <p><span className="font-medium">CNPJ:</span> {result.cnpj}</p>
            <p><span className="font-medium">Endereço:</span> {result.logradouro}, {result.numero}{result.complemento ? `, ${result.complemento}` : ''}</p>
            <p><span className="font-medium">Bairro:</span> {result.bairro}</p>
            <p><span className="font-medium">Cidade/UF:</span> {result.municipio}/{result.uf}</p>
            <p><span className="font-medium">CEP:</span> {result.cep}</p>
            <p><span className="font-medium">Telefone:</span> {result.telefone || 'Não informado'}</p>
            <p><span className="font-medium">E-mail:</span> {result.email || 'Não informado'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CNPJTest;
