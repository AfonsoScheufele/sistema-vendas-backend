import { Controller, Get } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  
  @Get('test')
  getTest() {
    return { message: 'Dashboard funcionando!' };
  }

  @Get('stats')
  getStats() {
    return {
      totalVendas: 0,
      clientesAtivos: 4,
      produtosEstoque: 5,
      pedidosPendentes: 0,
      faturamentoMes: 0,
      crescimentoVendas: 0,
      ticketMedio: 0,
      conversao: 0
    };
  }

  @Get('vendas-mensais')
  getVendasMensais() {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return meses.map((nome) => ({
      mes: nome,
      vendas: 0,
      pedidos: 0
    }));
  }

  @Get('produtos-mais-vendidos')
  getProdutosMaisVendidos() {
    return [
      { produto: 'Notebook Dell Inspiron', quantidade: 0, faturamento: 0 },
      { produto: 'Mouse Logitech MX Master 3', quantidade: 0, faturamento: 0 },
      { produto: 'Teclado Mecânico Corsair K95', quantidade: 0, faturamento: 0 },
      { produto: 'Monitor Samsung 24"', quantidade: 0, faturamento: 0 },
      { produto: 'Smartphone Samsung Galaxy A54', quantidade: 0, faturamento: 0 }
    ];
  }

  @Get('faturamento-diario')
  getFaturamentoDiario() {
    return [
      { data: 'Dom', faturamento: 0 },
      { data: 'Seg', faturamento: 0 },
      { data: 'Ter', faturamento: 0 },
      { data: 'Qua', faturamento: 0 },
      { data: 'Qui', faturamento: 0 },
      { data: 'Sex', faturamento: 0 },
      { data: 'Sáb', faturamento: 0 }
    ];
  }

  @Get('distribuicao-categorias')
  getDistribuicaoCategorias() {
    return [
      { categoria: 'Informática', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Periféricos', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Monitores', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Smartphones', quantidade: 0, percentual: 0, faturamento: 0 }
    ];
  }

  @Get('insights')
  getInsights() {
    return {
      produtosBaixoEstoque: 0,
      crescimentoSemanal: 0,
      clienteTop: null,
      alertas: []
    };
  }
}


@Controller('api/dashboard')
export class ApiDashboardController {
  
  @Get('stats')
  getStats() {
    return {
      totalVendas: 0,
      clientesAtivos: 4,
      produtosEstoque: 5,
      pedidosPendentes: 0,
      faturamentoMes: 0,
      crescimentoVendas: 0,
      ticketMedio: 0,
      conversao: 0
    };
  }

  @Get('vendas-mensais')
  getVendasMensais() {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return meses.map((nome) => ({
      mes: nome,
      vendas: 0,
      pedidos: 0
    }));
  }

  @Get('produtos-mais-vendidos')
  getProdutosMaisVendidos() {
    return [
      { produto: 'Notebook Dell Inspiron', quantidade: 0, faturamento: 0 },
      { produto: 'Mouse Logitech MX Master 3', quantidade: 0, faturamento: 0 },
      { produto: 'Teclado Mecânico Corsair K95', quantidade: 0, faturamento: 0 },
      { produto: 'Monitor Samsung 24"', quantidade: 0, faturamento: 0 },
      { produto: 'Smartphone Samsung Galaxy A54', quantidade: 0, faturamento: 0 }
    ];
  }

  @Get('faturamento-diario')
  getFaturamentoDiario() {
    return [
      { data: 'Dom', faturamento: 0 },
      { data: 'Seg', faturamento: 0 },
      { data: 'Ter', faturamento: 0 },
      { data: 'Qua', faturamento: 0 },
      { data: 'Qui', faturamento: 0 },
      { data: 'Sex', faturamento: 0 },
      { data: 'Sáb', faturamento: 0 }
    ];
  }

  @Get('distribuicao-categorias')
  getDistribuicaoCategorias() {
    return [
      { categoria: 'Informática', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Periféricos', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Monitores', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Smartphones', quantidade: 0, percentual: 0, faturamento: 0 }
    ];
  }

  @Get('insights')
  getInsights() {
    return {
      produtosBaixoEstoque: 0,
      crescimentoSemanal: 0,
      clienteTop: null,
      alertas: []
    };
  }
}
