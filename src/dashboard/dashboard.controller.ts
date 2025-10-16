import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { 
  DashboardStats, 
  VendasMensais, 
  ClientesNovos, 
  ProdutoMaisVendido, 
  FaturamentoDiario, 
  DistribuicaoCategoria 
} from './dashboard.types';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('test')
  getTest() {
    return { message: 'Dashboard funcionando!' };
  }

  @Get('stats')
  getStats(@Query('periodo') periodo?: string) {
    try {
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
    } catch (error) {
      console.error('Erro no controller:', error);
      throw error;
    }
  }

  @Get('vendas-mensais')
  getVendasMensais(@Query('ano') ano?: number) {
    return this.dashboardService.getVendasMensais(ano);
  }

  @Get('clientes-novos')
  getClientesNovos(@Query('periodo') periodo?: string) {
    return this.dashboardService.getClientesNovos(periodo);
  }

  @Get('produtos-mais-vendidos')
  getProdutosMaisVendidos(@Query('limite') limite?: number) {
    return this.dashboardService.getProdutosMaisVendidos(limite);
  }

  @Get('faturamento-diario')
  getFaturamentoDiario(@Query('periodo') periodo?: string) {
    return this.dashboardService.getFaturamentoDiario(periodo);
  }

  @Get('distribuicao-categorias')
  getDistribuicaoCategorias() {
    return this.dashboardService.getDistribuicaoCategorias();
  }

  @Get('insights')
  getInsights() {
    return this.dashboardService.getInsights();
  }

  @Get('resumo')
  getResumo(@Query('periodo') periodo?: string) {
    return this.dashboardService.getResumo(periodo);
  }

  @Get('metas')
  getMetas() {
    return this.dashboardService.getMetas();
  }

  @Get('alertas')
  getAlertas() {
    return this.dashboardService.getAlertas();
  }
}

// Controller adicional para compatibilidade com o frontend
@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class ApiDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Query('periodo') periodo?: string) {
    return this.dashboardService.getStats(periodo);
  }

  @Get('vendas-mensais')
  getVendasMensais(@Query('ano') ano?: number) {
    return this.dashboardService.getVendasMensais(ano);
  }

  @Get('produtos-mais-vendidos')
  getProdutosMaisVendidos(@Query('limite') limite?: number) {
    return this.dashboardService.getProdutosMaisVendidos(limite);
  }

  @Get('faturamento-diario')
  getFaturamentoDiario(@Query('periodo') periodo?: string) {
    return this.dashboardService.getFaturamentoDiario(periodo);
  }

  @Get('distribuicao-categorias')
  getDistribuicaoCategorias() {
    return this.dashboardService.getDistribuicaoCategorias();
  }

  @Get('insights')
  getInsights() {
    return this.dashboardService.getInsights();
  }
}