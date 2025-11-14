export const CONTRATO_STATUS = ['ativo', 'vencido', 'cancelado', 'renovado'] as const;
export type ContratoStatus = (typeof CONTRATO_STATUS)[number];
export const CONTRATO_TIPOS = ['compra', 'servico', 'manutencao', 'licenca'] as const;
export type ContratoTipo = (typeof CONTRATO_TIPOS)[number];

export interface Contrato {
  id: string;
  numero: string;
  fornecedor: string;
  descricao: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  status: ContratoStatus;
  tipo: ContratoTipo;
  responsavel: string;
  empresaId?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ContratoStats {
  total: number;
  porStatus: Record<ContratoStatus, number>;
  valorTotal: number;
  vigentes: number;
  vencendoEm30Dias: number;
}
