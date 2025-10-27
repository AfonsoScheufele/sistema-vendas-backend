import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Query('periodo') periodo?: string) {
    return await this.dashboardService.getStats(periodo);
  }

  @Get('insights')
  getInsights() {
    return this.dashboardService.getInsights();
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
}