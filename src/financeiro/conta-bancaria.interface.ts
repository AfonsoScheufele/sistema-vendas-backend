export type TipoContaBancaria = 'corrente' | 'poupanca' | 'investimento';

export interface ContaBancaria {
  id: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: TipoContaBancaria;
  saldoAtual: number;
  saldoDisponivel: number;
  saldoProjetado: number;
  moeda: string;
  titular: string;
  empresaId: string;
  atualizadoEm: string;
}
