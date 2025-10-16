export interface DashboardStats {
  totalVendas: number;
  clientesAtivos: number;
  produtosEstoque: number;
  pedidosPendentes: number;
  faturamentoMes: number;
  crescimentoVendas: number;
  ticketMedio: number;
  conversao: number;
}

export interface VendasMensais {
  mes: string;
  vendas: number;
  pedidos: number;
}

export interface ClientesNovos {
  periodo: string;
  quantidade: number;
}

export interface ProdutoMaisVendido {
  produto: string;
  quantidade: number;
  faturamento: number;
}

export interface FaturamentoDiario {
  data: string;
  faturamento: number;
}

export interface DistribuicaoCategoria {
  categoria: string;
  quantidade: number;
  percentual: number;
  faturamento: number;
}