import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ComprasService } from './compras.service';

@Controller('compras')
@UseGuards(JwtAuthGuard)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  // Pedidos de Compra
  @Get('pedidos')
  listarPedidosCompra(@Query() filtros: any) {
    return this.comprasService.listarPedidosCompra(filtros);
  }

  @Post('pedidos')
  @HttpCode(HttpStatus.CREATED)
  criarPedidoCompra(@Body() createPedidoDto: any) {
    return this.comprasService.criarPedidoCompra(createPedidoDto);
  }

  @Get('pedidos/:id')
  obterPedidoCompra(@Param('id') id: string) {
    return this.comprasService.obterPedidoCompra(+id);
  }

  @Patch('pedidos/:id')
  atualizarPedidoCompra(@Param('id') id: string, @Body() updatePedidoDto: any) {
    return this.comprasService.atualizarPedidoCompra(+id, updatePedidoDto);
  }

  @Patch('pedidos/:id/aprovar')
  aprovarPedidoCompra(@Param('id') id: string) {
    return this.comprasService.aprovarPedidoCompra(+id);
  }

  @Patch('pedidos/:id/enviar')
  enviarPedidoCompra(@Param('id') id: string) {
    return this.comprasService.enviarPedidoCompra(+id);
  }

  @Patch('pedidos/:id/receber')
  receberPedidoCompra(@Param('id') id: string) {
    return this.comprasService.receberPedidoCompra(+id);
  }

  @Delete('pedidos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerPedidoCompra(@Param('id') id: string) {
    return this.comprasService.removerPedidoCompra(+id);
  }

  // Avaliações de Fornecedor
  @Get('avaliacoes')
  listarAvaliacoes(@Query() filtros: any) {
    return this.comprasService.listarAvaliacoes(filtros);
  }

  @Post('avaliacoes')
  @HttpCode(HttpStatus.CREATED)
  criarAvaliacao(@Body() createAvaliacaoDto: any) {
    return this.comprasService.criarAvaliacao(createAvaliacaoDto);
  }

  @Get('avaliacoes/:id')
  obterAvaliacao(@Param('id') id: string) {
    return this.comprasService.obterAvaliacao(+id);
  }

  @Patch('avaliacoes/:id')
  atualizarAvaliacao(@Param('id') id: string, @Body() updateAvaliacaoDto: any) {
    return this.comprasService.atualizarAvaliacao(+id, updateAvaliacaoDto);
  }

  @Delete('avaliacoes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerAvaliacao(@Param('id') id: string) {
    return this.comprasService.removerAvaliacao(+id);
  }

  // Contratos de Fornecedor
  @Get('contratos')
  listarContratos(@Query() filtros: any) {
    return this.comprasService.listarContratos(filtros);
  }

  @Post('contratos')
  @HttpCode(HttpStatus.CREATED)
  criarContrato(@Body() createContratoDto: any) {
    return this.comprasService.criarContrato(createContratoDto);
  }

  @Get('contratos/:id')
  obterContrato(@Param('id') id: string) {
    return this.comprasService.obterContrato(+id);
  }

  @Patch('contratos/:id')
  atualizarContrato(@Param('id') id: string, @Body() updateContratoDto: any) {
    return this.comprasService.atualizarContrato(+id, updateContratoDto);
  }

  @Patch('contratos/:id/renovar')
  renovarContrato(@Param('id') id: string, @Body() renovacaoDto: any) {
    return this.comprasService.renovarContrato(+id, renovacaoDto);
  }

  @Delete('contratos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerContrato(@Param('id') id: string) {
    return this.comprasService.removerContrato(+id);
  }

  // Relatórios de Compras
  @Get('relatorios/resumo')
  obterResumoCompras(@Query() filtros: any) {
    return this.comprasService.obterResumoCompras(filtros);
  }

  @Get('relatorios/fornecedores')
  obterRelatorioFornecedores(@Query() filtros: any) {
    return this.comprasService.obterRelatorioFornecedores(filtros);
  }

  @Get('relatorios/produtos')
  obterRelatorioProdutos(@Query() filtros: any) {
    return this.comprasService.obterRelatorioProdutos(filtros);
  }
}
