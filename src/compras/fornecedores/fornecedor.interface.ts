export type FornecedorStatus = 'ativo' | 'inativo' | 'bloqueado';
export type FornecedorCategoria = 'materiais' | 'servicos' | 'tecnologia' | 'logistica' | 'financeiro';

export interface FornecedorContato {
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
  celular?: string;
}

export interface FornecedorEndereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface FornecedorProdutoResumo {
  id: number;
  nome: string;
  categoria: string;
  precoMedio: number;
}

export interface Fornecedor {
  id: string;
  nome: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco: FornecedorEndereco;
  contato: FornecedorContato;
  bancario: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: 'corrente' | 'poupanca';
  };
  categoria: FornecedorCategoria;
  status: FornecedorStatus;
  dataCadastro: string;
  observacoes?: string;
  produtos: FornecedorProdutoResumo[];
  empresaId: string;
  criadoEm: string;
  atualizadoEm: string;
}
