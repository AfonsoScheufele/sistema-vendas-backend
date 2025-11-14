import { Controller, Get, Query, Req, Res, UseGuards, Param } from '@nestjs/common';
import { Response } from 'express';
import { RelatoriosService } from './relatorios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('relatorios')
@UseGuards(JwtAuthGuard)
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('dashboard')
  async obterDashboard(@Req() req: any) {
    return this.relatoriosService.obterDashboard(req.empresaId);
  }

  @Get('vendas')
  async obterRelatorioVendas(
    @Req() req: any,
    @Query('periodo') periodo?: string,
    @Query('vendedorId') vendedorId?: string,
  ) {
    return this.relatoriosService.obterRelatorioVendas(req.empresaId, { periodo, vendedorId });
  }

  @Get('clientes')
  async obterRelatorioClientes(
    @Req() req: any,
    @Query('periodo') periodo?: string,
  ) {
    return this.relatoriosService.obterRelatorioClientes(req.empresaId, { periodo });
  }

  @Get('financeiro')
  async obterRelatorioFinanceiro(
    @Req() req: any,
    @Query('periodo') periodo?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.relatoriosService.obterRelatorioFinanceiro(req.empresaId, { periodo, tipo });
  }

  @Get('kpis')
  async obterRelatorioKPIs(
    @Req() req: any,
    @Query('periodo') periodo?: string,
  ) {
    return this.relatoriosService.obterRelatorioKPIs(req.empresaId, { periodo });
  }

  @Get('compras')
  async obterRelatorioCompras(
    @Req() req: any,
    @Query('periodo') periodo?: string,
  ) {
    return this.relatoriosService.obterRelatorioCompras(req.empresaId, { periodo });
  }

  @Get('estoque')
  async obterRelatorioEstoque(
    @Req() req: any,
    @Query('depositoId') depositoId?: string,
  ) {
    return this.relatoriosService.obterRelatorioEstoque(req.empresaId, { depositoId });
  }

  @Get('exportar/:tipo')
  async exportarRelatorio(
    @Req() req: any,
    @Param('tipo') tipo: string,
    @Query('formato') formato: 'csv' | 'json' = 'csv',
    @Query('periodo') periodo?: string,
    @Query('vendedorId') vendedorId?: string,
    @Query('depositoId') depositoId?: string,
    @Res() res: Response,
  ) {
    const data = await this.relatoriosService.exportarRelatorio(
      req.empresaId,
      tipo,
      formato,
      { periodo, vendedorId, depositoId },
    );

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `relatorio_${tipo}_${timestamp}.${formato}`;

    if (formato === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(data);
    } else {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(data);
    }
  }
}


