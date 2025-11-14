export type OrcamentoPeriodo = 'mensal' | 'trimestral' | 'anual';

export interface OrcamentoLinhaCentroCusto {
  id: string;
  centroCusto: string;
  categoria: string;
  tipo: 'receita' | 'despesa';
  metaAnual: number;
  realizadoAnual: number;
  variacaoPercentual: number;
  periodo: OrcamentoPeriodo;
  empresaId: string;
  metasMensais: Array<{
    id: string;
    mes: string;
    meta: number;
    realizado: number;
  }>;
}

export interface OrcamentoResumo {
  totalReceitasPlanejadas: number;
  totalReceitasRealizadas: number;
  totalDespesasPlanejadas: number;
  totalDespesasRealizadas: number;
  resultadoPlanejado: number;
  resultadoRealizado: number;
  variacaoResultado: number;
}

export interface OrcamentoAlerta {
  centroCusto: string;
  categoria: string;
  variacaoPercentual: number;
  mensagem: string;
  impacto: 'baixo' | 'medio' | 'alto';
}

export interface OrcamentoResponse {
  resumo: OrcamentoResumo;
  linhas: OrcamentoLinhaCentroCusto[];
  alertas: OrcamentoAlerta[];
  ultimoAtualizadoEm: string;
}

