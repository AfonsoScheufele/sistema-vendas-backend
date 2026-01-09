import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ComprasAvancadasService } from './compras-avancadas.service';

@Controller('compras')
@UseGuards(JwtAuthGuard)
export class ComprasExpandedController {
  constructor(private readonly comprasAvancadasService: ComprasAvancadasService) {}

  @Get('cotacoes')
  async listarCotacoes(@Req() req: any, @Query('status') status?: string) {
    return this.comprasAvancadasService.listarCotacoes(req.empresaId, { status });
  }

  @Get('cotacoes/stats')
  async obterStatsCotacoes(@Req() req: any) {
    return this.comprasAvancadasService.obterStatsCotacoes(req.empresaId);
  }

  @Post('cotacoes')
  async criarCotacao(@Body() body: any, @Req() req: any) {
    return this.comprasAvancadasService.criarCotacao(req.empresaId, body);
  }

  @Get('requisicoes')
  async listarRequisicoes(@Req() req: any, @Query('status') status?: string) {
    return this.comprasAvancadasService.listarRequisicoes(req.empresaId, { status });
  }

  @Get('requisicoes/stats')
  async obterStatsRequisicoes(@Req() req: any) {
    return this.comprasAvancadasService.obterStatsRequisicoes(req.empresaId);
  }

  @Post('requisicoes')
  async criarRequisicao(@Body() body: any, @Req() req: any) {
    const solicitanteId = req.user?.id || req.user?.sub;
    return this.comprasAvancadasService.criarRequisicao(req.empresaId, { ...body, solicitanteId });
  }

  @Patch('requisicoes/:id')
  async atualizarRequisicao(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.comprasAvancadasService.atualizarRequisicao(+id, req.empresaId, body);
  }

  @Patch('requisicoes/:id/aprovar')
  async aprovarRequisicao(@Param('id') id: string, @Req() req: any) {
    const aprovadorNome = req.user?.name || req.user?.nome || 'Sistema';
    return this.comprasAvancadasService.aprovarRequisicao(+id, req.empresaId, aprovadorNome);
  }

  @Patch('requisicoes/:id/rejeitar')
  async rejeitarRequisicao(@Param('id') id: string, @Body() body: { motivo: string }, @Req() req: any) {
    const rejeitadorNome = req.user?.name || req.user?.nome || 'Sistema';
    return this.comprasAvancadasService.rejeitarRequisicao(+id, req.empresaId, body.motivo, rejeitadorNome);
  }

  @Get('pedidos')
  async listarPedidos(@Req() req: any, @Query('status') status?: string) {
    return this.comprasAvancadasService.listarPedidosCompra(req.empresaId, { status });
  }

  @Get('pedidos/stats')
  async obterStatsPedidos(@Req() req: any) {
    return this.comprasAvancadasService.obterStatsPedidosCompra(req.empresaId);
  }

  @Post('pedidos')
  async criarPedido(@Body() body: any, @Req() req: any) {
    return this.comprasAvancadasService.criarPedidoCompra(req.empresaId, body);
  }

  @Patch('pedidos/:id')
  async atualizarPedido(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.comprasAvancadasService.atualizarPedidoCompra(+id, req.empresaId, body);
  }
}
