export type InvestimentoClasse =
  | 'renda_fixa'
  | 'renda_variavel'
  | 'caixa'
  | 'fundo_imobiliario'
  | 'internacional';

export interface InvestimentoAtivo {
  id: string;
  carteiraId: string;
  ativo: string;
  classe: InvestimentoClasse;
  instituicao: string;
  valorAplicado: number;
  valorAtual: number;
  rentabilidade12m: number;
  risco: 'baixo' | 'medio' | 'alto';
  aplicadoEm?: string;
  atualizadoEm?: string;
}

export interface InvestimentoCarteira {
  id: string;
  nome: string;
  objetivo?: string;
  saldoAplicado: number;
  saldoAtual: number;
  rentabilidadeMensal: number;
  rentabilidade12m: number;
  risco: 'baixo' | 'medio' | 'alto';
}

export interface InvestimentoDistribuicao {
  classe: InvestimentoClasse;
  percentual: number;
  valor: number;
}

export interface InvestimentoHistorico {
  data: string;
  rentabilidade: number;
  aporte?: number;
  resgate?: number;
}

export interface InvestimentoResumo {
  totalAplicado: number;
  totalAtual: number;
  rentabilidadeAcumulada: number;
  rentabilidadeNoMes: number;
  variacaoPatrimonio: number;
}

export interface InvestimentoAlerta {
  carteira: string;
  recomendacao: string;
  impacto: 'baixo' | 'medio' | 'alto';
}

export interface InvestimentoResponse {
  resumo: InvestimentoResumo;
  distribuicao: InvestimentoDistribuicao[];
  carteiras: InvestimentoCarteira[];
  ativos: InvestimentoAtivo[];
  historico: InvestimentoHistorico[];
  alertas: InvestimentoAlerta[];
}

