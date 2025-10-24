import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { EstoqueService } from './estoque.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('estoque')
@UseGuards(JwtAuthGuard)
export class EstoqueController {
  constructor(private readonly estoqueService: EstoqueService) {}

  @Post('movimentacoes')
  @HttpCode(HttpStatus.CREATED)
  criarMovimentacao(@Body() createMovimentacaoDto: any) {
    return this.estoqueService.criarMovimentacao(createMovimentacaoDto);
  }

  @Get('movimentacoes')
  listarMovimentacoes(@Query() filtros: any) {
    return this.estoqueService.listarMovimentacoes(filtros);
  }

  @Post('lotes')
  @HttpCode(HttpStatus.CREATED)
  criarLote(@Body() createLoteDto: any) {
    return this.estoqueService.criarLote(createLoteDto);
  }

  @Get('lotes')
  listarLotes(@Query() filtros: any) {
    return this.estoqueService.listarLotes(filtros);
  }

  
  @Get('inventarios')
  listarInventarios(@Query() filtros: any) {
    return this.estoqueService.listarInventarios(filtros);
  }

  @Post('inventarios')
  @HttpCode(HttpStatus.CREATED)
  criarInventario(@Body() createInventarioDto: any) {
    return this.estoqueService.criarInventario(createInventarioDto);
  }

  @Get('inventarios/:id')
  obterInventario(@Param('id') id: string) {
    return this.estoqueService.obterInventario(+id);
  }

  @Patch('inventarios/:id')
  atualizarInventario(@Param('id') id: string, @Body() updateInventarioDto: any) {
    return this.estoqueService.atualizarInventario(+id, updateInventarioDto);
  }

  @Delete('inventarios/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerInventario(@Param('id') id: string) {
    return this.estoqueService.removerInventario(+id);
  }

  
  @Get('alertas')
  listarAlertas(@Query() filtros: any) {
    return this.estoqueService.listarAlertas(filtros);
  }

  @Post('alertas')
  @HttpCode(HttpStatus.CREATED)
  criarAlerta(@Body() createAlertaDto: any) {
    return this.estoqueService.criarAlerta(createAlertaDto);
  }

  @Get('alertas/:id')
  obterAlerta(@Param('id') id: string) {
    return this.estoqueService.obterAlerta(+id);
  }

  @Patch('alertas/:id')
  atualizarAlerta(@Param('id') id: string, @Body() updateAlertaDto: any) {
    return this.estoqueService.atualizarAlerta(+id, updateAlertaDto);
  }

  @Patch('alertas/:id/resolver')
  resolverAlerta(@Param('id') id: string) {
    return this.estoqueService.resolverAlerta(+id);
  }

  @Delete('alertas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerAlerta(@Param('id') id: string) {
    return this.estoqueService.removerAlerta(+id);
  }

  
  @Get('transferencias')
  listarTransferencias(@Query() filtros: any) {
    return this.estoqueService.listarTransferencias(filtros);
  }

  @Post('transferencias')
  @HttpCode(HttpStatus.CREATED)
  criarTransferencia(@Body() createTransferenciaDto: any) {
    return this.estoqueService.criarTransferencia(createTransferenciaDto);
  }

  @Get('transferencias/:id')
  obterTransferencia(@Param('id') id: string) {
    return this.estoqueService.obterTransferencia(+id);
  }

  @Patch('transferencias/:id')
  atualizarTransferencia(@Param('id') id: string, @Body() updateTransferenciaDto: any) {
    return this.estoqueService.atualizarTransferencia(+id, updateTransferenciaDto);
  }

  @Patch('transferencias/:id/confirmar')
  confirmarTransferencia(@Param('id') id: string) {
    return this.estoqueService.confirmarTransferencia(+id);
  }

  @Delete('transferencias/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerTransferencia(@Param('id') id: string) {
    return this.estoqueService.removerTransferencia(+id);
  }

  
  @Get('produtos')
  obterProdutosEstoque(@Query() filtros: any) {
    return this.estoqueService.obterProdutosEstoque(filtros);
  }

  @Get('produtos/:id/estoque')
  obterEstoqueProduto(@Param('id') id: string) {
    return this.estoqueService.obterEstoqueProduto(+id);
  }
}










