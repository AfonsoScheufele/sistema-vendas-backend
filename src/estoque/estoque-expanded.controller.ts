import { Controller, Get, Post, Patch, Query, UseGuards, Inject, forwardRef, Req, Body, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProdutosModule } from '../produtos/produtos.module';
import { ProdutosService } from '../produtos/produtos.service';
import { EstoqueService } from './estoque.service';
import { EstoqueAvancadoService } from './estoque-avancado.service';

@Controller('estoque')
@UseGuards(JwtAuthGuard)
export class EstoqueExpandedController {
  constructor(
    @Inject(forwardRef(() => ProdutosService))
    private readonly produtosService: ProdutosService,
    private readonly estoqueService: EstoqueService,
    private readonly estoqueAvancadoService: EstoqueAvancadoService,
  ) {}

  @Get('produtos')
  async listarProdutosEstoque(@Req() req: any) {
    return this.produtosService.findAll(req.empresaId);
  }

  @Get('lotes')
  async listarLotes(
    @Req() req: any,
    @Query('produtoId') produtoId?: string,
    @Query('depositoId') depositoId?: string,
  ) {
    return this.estoqueAvancadoService.listarLotes(req.empresaId, {
      produtoId: produtoId ? Number(produtoId) : undefined,
      depositoId,
    });
  }

  @Post('lotes')
  async criarLote(@Body() body: any, @Req() req: any) {
    return this.estoqueAvancadoService.criarLote(req.empresaId, body);
  }

  @Patch('lotes/:id')
  async atualizarLote(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.estoqueAvancadoService.atualizarLote(+id, req.empresaId, body);
  }

  @Get('lotes/vencendo')
  async obterLotesVencendo(@Req() req: any, @Query('dias') dias?: string) {
    return this.estoqueAvancadoService.obterLotesVencendo(req.empresaId, dias ? Number(dias) : 30);
  }

  @Get('inventarios')
  async listarInventarios(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('depositoId') depositoId?: string,
  ) {
    return this.estoqueAvancadoService.listarInventarios(req.empresaId, { status, depositoId });
  }

  @Get('inventarios/stats')
  async obterStatsInventarios(@Req() req: any) {
    return this.estoqueAvancadoService.obterStatsInventarios(req.empresaId);
  }

  @Post('inventarios')
  async criarInventario(@Body() body: any, @Req() req: any) {
    return this.estoqueAvancadoService.criarInventario(req.empresaId, body);
  }

  @Patch('inventarios/:id')
  async atualizarInventario(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.estoqueAvancadoService.atualizarInventario(+id, req.empresaId, body);
  }

  @Get('transferencias')
  async listarTransferencias(@Req() req: any) {
    return this.estoqueService.listarMovimentacoes(req.empresaId, { tipo: 'transferencia' });
  }

  @Get('transferencias/stats')
  async obterStatsTransferencias(@Req() req: any) {
    const movimentacoes = await this.estoqueService.listarMovimentacoes(req.empresaId, {
      tipo: 'transferencia',
    });
    return {
      total: movimentacoes.length,
      pendentes: 0,
      concluidas: movimentacoes.length,
    };
  }

  @Get('depositos')
  async listarDepositos(@Req() req: any) {
    return this.estoqueService.listarDepositos(req.empresaId);
  }

  @Get('stats')
  async obterEstoqueStats(@Req() req: any) {
    return this.estoqueService.obterEstatisticas(req.empresaId);
  }
}
