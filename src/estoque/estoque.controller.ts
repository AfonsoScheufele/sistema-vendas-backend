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

  @Get('inventario')
  obterInventario() {
    return this.estoqueService.obterInventario();
  }

  @Get('alertas')
  obterAlertasEstoque() {
    return this.estoqueService.obterAlertasEstoque();
  }
}





