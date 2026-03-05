import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProdutosService } from '../produtos/produtos.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly produtosService: ProdutosService,
  ) {}

  @Get('stats')
  async getStats(@Req() req: any, @Query('periodo') periodo?: string) {
    if (!req.empresaId) {
      return { totalVendas: 0, clientesAtivos: 0, produtosEstoque: 0, pedidosPendentes: 0, faturamentoMes: 0, crescimentoVendas: 0, ticketMedio: 0, conversao: 0 };
    }
    return await this.dashboardService.getStats(periodo, req.empresaId, req.user);
  }

  @Get('insights')
  getInsights(@Req() req: any) {
    if (!req.empresaId) return [];
    return this.dashboardService.getInsights(req.empresaId, req.user);
  }

  @Get('vendas-mensais')
  getVendasMensais(@Req() req: any, @Query('ano') ano?: number) {
    if (!req.empresaId) return [];
    return this.dashboardService.getVendasMensais(ano, req.empresaId, req.user);
  }

  @Get('clientes-novos')
  getClientesNovos(@Req() req: any, @Query('periodo') periodo?: string) {
    if (!req.empresaId) return [];
    return this.dashboardService.getClientesNovos(periodo, req.empresaId, req.user);
  }

  @Get('produtos-mais-vendidos')
  getProdutosMaisVendidos(@Req() req: any, @Query('limite') limite?: number) {
    if (!req.empresaId) return [];
    return this.dashboardService.getProdutosMaisVendidos(limite, req.empresaId, req.user);
  }

  @Get('faturamento-diario')
  getFaturamentoDiario(@Req() req: any, @Query('periodo') periodo?: string) {
    if (!req.empresaId) return [];
    return this.dashboardService.getFaturamentoDiario(periodo, req.empresaId, req.user);
  }

  @Get('distribuicao-categorias')
  getDistribuicaoCategorias(@Req() req: any) {
    if (!req.empresaId) return [];
    return this.dashboardService.getDistribuicaoCategorias(req.empresaId, req.user);
  }

  @Get('relatorios/vendas')
  getRelatorioVendas(@Req() req: any, @Query('periodo') periodo?: string) {
    if (!req.empresaId) return [];
    return this.dashboardService.getRelatorioVendas(periodo, req.empresaId, req.user);
  }

  @Get('relatorios/clientes')
  getRelatorioClientes(@Req() req: any, @Query('periodo') periodo?: string) {
    if (!req.empresaId) return [];
    return this.dashboardService.getRelatorioClientes(periodo, req.empresaId, req.user);
  }

  @Get('relatorios/estoque')
  getRelatorioEstoque(@Req() req: any, @Query('periodo') periodo?: string) {
    if (!req.empresaId) return [];
    return this.dashboardService.getRelatorioEstoque(periodo, req.empresaId, req.user);
  }

  @Get('relatorios/financeiro')
  getRelatorioFinanceiro(@Req() req: any, @Query('periodo') periodo?: string, @Query('tipo') tipo?: string) {
    if (!req.empresaId) return [];
    return this.dashboardService.getRelatorioFinanceiro(periodo, tipo, req.empresaId, req.user);
  }

  @Get('relatorios/compras')
  getRelatorioCompras(@Req() req: any) {
    if (!req.empresaId) return [];
    return this.dashboardService.getRelatorioCompras(req.empresaId, req.user);
  }

  @Get('estoque-baixo')
  async getEstoqueBaixo(@Req() req: any) {
    if (!req.empresaId) return [];
    return this.produtosService.getEstoqueBaixo(req.empresaId);
  }
}