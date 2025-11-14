import { FornecedorCategoria, FornecedorStatus } from '../fornecedor.interface';

export class CreateFornecedorDto {
  nome: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    nome: string;
    cargo: string;
    telefone: string;
    email: string;
    celular?: string;
  };
  bancario: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: 'corrente' | 'poupanca';
  };
  categoria: FornecedorCategoria;
  status: FornecedorStatus;
  observacoes?: string;
  produtos?: Array<{
    id: number;
    nome: string;
    categoria: string;
    precoMedio: number;
  }>;
}
