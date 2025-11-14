export type StatusReceber = 'aberta' | 'vencida' | 'recebida' | 'negociada';

export interface ContaReceber {
  id: string;
  titulo: string;
  cliente: string;
  valor: number;
  valorPago: number;
  emissao: string;
  vencimento: string;
  pagamento?: string;
  status: StatusReceber;
  categoria?: string;
  formaPagamento?: string;
  responsavel?: string;
  observacoes?: string;
  empresaId: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ContaReceberStats {
  totalTitulo: number;
  totalEmAberto: number;
  totalRecebido: number;
  totalVencido: number;
  quantidadeAberta: number;
  quantidadeVencida: number;
  quantidadeRecebida: number;
}
