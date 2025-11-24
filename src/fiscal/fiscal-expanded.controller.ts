import { Controller, Get, Post, Body, Query, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FiscalService } from './fiscal.service';

@Controller('fiscal')
@UseGuards(JwtAuthGuard)
export class FiscalExpandedController {
  constructor(private readonly fiscalService: FiscalService) {}

  @Get('notas-fiscais')
  async listarNotasFiscais(
    @Req() req: any,
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
  ) {
    return this.fiscalService.listarNotasFiscais(req.empresaId, { tipo, status });
  }

  @Get('notas-fiscais/stats')
  async obterStatsNotasFiscais(@Req() req: any) {
    return this.fiscalService.obterStatsNotasFiscais(req.empresaId);
  }

  @Get('notas-fiscais/:id')
  async obterNotaFiscalPorId(@Param('id') id: string, @Req() req: any) {
    return this.fiscalService.obterNotaFiscalPorId(+id, req.empresaId);
  }

  @Post('notas-fiscais')
  async criarNotaFiscal(@Body() body: any, @Req() req: any) {
    return this.fiscalService.criarNotaFiscal(req.empresaId, body);
  }

  @Patch('notas-fiscais/:id')
  async atualizarNotaFiscal(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.fiscalService.atualizarNotaFiscal(+id, req.empresaId, body);
  }

  @Patch('notas-fiscais/:id/cancelar')
  async cancelarNotaFiscal(@Param('id') id: string, @Req() req: any) {
    return this.fiscalService.cancelarNotaFiscal(+id, req.empresaId);
  }

  @Get('sped')
  async listarSped(
    @Req() req: any,
    @Query('tipo') tipo?: string,
    @Query('competencia') competencia?: string,
  ) {
    return this.fiscalService.listarSped(req.empresaId, { tipo, competencia });
  }

  @Post('sped')
  async criarSped(@Body() body: any, @Req() req: any) {
    return this.fiscalService.criarSped(req.empresaId, body);
  }

  @Get('impostos')
  async listarImpostos(@Req() req: any, @Query('tipo') tipo?: string) {
    return this.fiscalService.listarImpostos(req.empresaId, { tipo });
  }

  @Post('impostos')
  async criarImposto(@Body() body: any, @Req() req: any) {
    return this.fiscalService.criarImposto(req.empresaId, body);
  }

  @Patch('impostos/:id')
  async atualizarImposto(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.fiscalService.atualizarImposto(+id, req.empresaId, body);
  }

  @Get('relatorios')
  async listarRelatorios(@Req() req: any) {
    const stats = await this.fiscalService.obterStatsNotasFiscais(req.empresaId);
    const impostos = await this.fiscalService.listarImpostos(req.empresaId);
    return {
      notasFiscais: stats,
      impostos: {
        total: impostos.length,
        porTipo: impostos.reduce((acc, imp) => {
          acc[imp.tipo] = (acc[imp.tipo] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }
}
