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
    return await this.dashboardService.getStats(periodo, req.empresaId);
  }

  @Get('insights')
  getInsights(@Req() req: any) {
    return this.dashboardService.getInsights(req.empresaId);
  }

  @Get('vendas-mensais')
  getVendasMensais(@Req() req: any, @Query('ano') ano?: number) {
    return this.dashboardService.getVendasMensais(ano, req.empresaId);
  }

  @Get('clientes-novos')
  getClientesNovos(@Req() req: any, @Query('periodo') periodo?: string) {
    return this.dashboardService.getClientesNovos(periodo, req.empresaId);
  }

  @Get('produtos-mais-vendidos')
  getProdutosMaisVendidos(@Req() req: any, @Query('limite') limite?: number) {
    return this.dashboardService.getProdutosMaisVendidos(limite, req.empresaId);
  }

  @Get('faturamento-diario')
  getFaturamentoDiario(@Req() req: any, @Query('periodo') periodo?: string) {
    return this.dashboardService.getFaturamentoDiario(periodo, req.empresaId);
  }

  @Get('distribuicao-categorias')
  getDistribuicaoCategorias(@Req() req: any) {
    return this.dashboardService.getDistribuicaoCategorias(req.empresaId);
  }

  @Get('relatorios/vendas')
  getRelatorioVendas(@Req() req: any, @Query('periodo') periodo?: string) {
    return this.dashboardService.getRelatorioVendas(periodo, req.empresaId);
  }

  @Get('relatorios/clientes')
  getRelatorioClientes(@Req() req: any, @Query('periodo') periodo?: string) {
    return this.dashboardService.getRelatorioClientes(periodo, req.empresaId);
  }

  @Get('relatorios/estoque')
  getRelatorioEstoque(@Req() req: any, @Query('periodo') periodo?: string) {
    return this.dashboardService.getRelatorioEstoque(periodo, req.empresaId);
  }

  @Get('relatorios/financeiro')
  getRelatorioFinanceiro(@Req() req: any, @Query('periodo') periodo?: string, @Query('tipo') tipo?: string) {
    return this.dashboardService.getRelatorioFinanceiro(periodo, tipo, req.empresaId);
  }

  @Get('relatorios/compras')
  getRelatorioCompras(@Req() req: any) {
    return this.dashboardService.getRelatorioCompras(req.empresaId);
  }

  @Get('estoque-baixo')
  async getEstoqueBaixo(@Req() req: any) {
    return this.produtosService.getEstoqueBaixo(req.empresaId);
  }
}