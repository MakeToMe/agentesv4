/**
 * Serviço para validação de CNPJ usando a API do Brasil API
 */

interface CNPJResponse {
  uf: string;
  cep: string;
  qsa: Array<{
    pais: string | null;
    nome_socio: string;
    codigo_pais: string | null;
    faixa_etaria: string;
    cnpj_cpf_do_socio: string;
    qualificacao_socio: string;
    codigo_faixa_etaria: number;
    data_entrada_sociedade: string;
    identificador_de_socio: number;
    cpf_representante_legal: string;
    nome_representante_legal: string;
    codigo_qualificacao_socio: number;
    qualificacao_representante_legal: string;
    codigo_qualificacao_representante_legal: number;
  }>;
  cnpj: string;
  pais: string | null;
  email: string | null;
  porte: string;
  bairro: string;
  numero: string;
  ddd_fax: string;
  municipio: string;
  logradouro: string;
  cnae_fiscal: number;
  codigo_pais: string | null;
  complemento: string;
  codigo_porte: number;
  razao_social: string;
  nome_fantasia: string;
  capital_social: number;
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  opcao_pelo_mei: boolean | null;
  descricao_porte: string;
  codigo_municipio: number;
  cnaes_secundarios: Array<{
    codigo: number;
    descricao: string;
  }>;
  natureza_juridica: string;
  situacao_especial: string;
  opcao_pelo_simples: boolean | null;
  situacao_cadastral: number;
  data_opcao_pelo_mei: string | null;
  data_exclusao_do_mei: string | null;
  cnae_fiscal_descricao: string;
  codigo_municipio_ibge: number;
  data_inicio_atividade: string;
  data_situacao_especial: string | null;
  data_opcao_pelo_simples: string | null;
  data_situacao_cadastral: string;
  nome_cidade_no_exterior: string;
  codigo_natureza_juridica: number;
  data_exclusao_do_simples: string | null;
  motivo_situacao_cadastral: number;
  ente_federativo_responsavel: string;
  identificador_matriz_filial: number;
  qualificacao_do_responsavel: number;
  descricao_situacao_cadastral: string;
  descricao_tipo_de_logradouro: string;
  descricao_motivo_situacao_cadastral: string;
  descricao_identificador_matriz_filial: string;
}

// Interface para o formato de resposta simplificado que usamos na aplicação
interface CompanyData {
  status: string;
  nome: string;
  fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  cnpj: string;
}

/**
 * Valida um CNPJ usando a API do Brasil API
 * @param cnpj CNPJ a ser validado (apenas números)
 * @returns Dados da empresa
 */
export const validateCnpj = async (cnpj: string): Promise<CompanyData> => {
  try {
    console.log('Validando CNPJ com Brasil API:', cnpj);
    
    // Remover caracteres não numéricos
    const cnpjNumerico = cnpj.replace(/\D/g, '');
    
    // Fazer a requisição para a API do Brasil API
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjNumerico}`);
    
    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      console.error('Erro na resposta da API:', response.status, response.statusText);
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    
    // Converter a resposta para JSON
    const data: CNPJResponse = await response.json();
    console.log('Resposta da API Brasil API:', data);
    
    // Formatar o telefone
    const telefone = data.ddd_telefone_1 
      ? `(${data.ddd_telefone_1.substring(0, 2)}) ${data.ddd_telefone_1.substring(2)}`
      : '';
    
    // Formatar os dados para o formato esperado pela aplicação
    return {
      status: 'OK',
      nome: data.razao_social,
      fantasia: data.nome_fantasia || data.razao_social,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento || '',
      bairro: data.bairro,
      municipio: data.municipio,
      uf: data.uf,
      cep: data.cep.replace(/(\d{5})(\d{3})/, '$1-$2'),
      telefone,
      email: data.email || '',
      cnpj: cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    };
  } catch (error) {
    console.error('Erro ao validar CNPJ:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados para testes
    if (process.env.NODE_ENV === 'development') {
      console.log('Usando dados simulados para desenvolvimento');
      return mockValidateCnpj(cnpj);
    }
    
    throw error;
  }
};

/**
 * Função de mock para validação de CNPJ em ambiente de desenvolvimento
 * @param cnpj CNPJ a ser validado (apenas números)
 * @returns Dados simulados da empresa
 */
const mockValidateCnpj = (cnpj: string): CompanyData => {
  const cnpjFormatado = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  
  return {
    status: 'OK',
    nome: `Empresa Simulada ${cnpj.substring(0, 5)}`,
    fantasia: `Fantasia ${cnpj.substring(0, 5)}`,
    logradouro: 'Rua Exemplo',
    numero: '123',
    complemento: 'Sala 101',
    bairro: 'Centro',
    municipio: 'São Paulo',
    uf: 'SP',
    cep: '01001-000',
    telefone: '(11) 99999-9999',
    email: `contato@empresa${cnpj.substring(0, 5)}.com.br`,
    cnpj: cnpjFormatado
  };
};
