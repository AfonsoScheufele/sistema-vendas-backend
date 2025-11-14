export type StatusPagar = 'aberta' | 'programada' | 'paga' | 'atrasada';

export interface ContaPagar {
  id: string;
  titulo: string;
  fornecedor: string;
  valor: number;
  valorPago: number;
  emissao: string;
  vencimento: string;
  pagamento?: string;
  status: StatusPagar;
  centroCusto?: string;
  formaPagamento?: string;
  responsavel?: string;
  observacoes?: string;
  empresaId: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ContaPagarStats {
  totalTitulo: number;
  totalPago: number;
  totalAberto: number;
  totalAtrasado: number;
  quantidadeAberta: number;
  quantidadeAtrasada: number;
  quantidadePaga: number;
}
