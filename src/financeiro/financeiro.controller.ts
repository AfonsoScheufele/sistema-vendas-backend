import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('financeiro')
@UseGuards(JwtAuthGuard)
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post('bancos')
  @HttpCode(HttpStatus.CREATED)
  criarBanco(@Body() createBancoDto: any) {
    return this.financeiroService.criarBanco(createBancoDto);
  }

  @Get('bancos')
  listarBancos() {
    return this.financeiroService.listarBancos();
  }

  @Get('bancos/:id')
  obterBanco(@Param('id') id: string) {
    return this.financeiroService.obterBanco(+id);
  }

  @Post('movimentacoes')
  @HttpCode(HttpStatus.CREATED)
  criarMovimentacao(@Body() createMovimentacaoDto: any) {
    return this.financeiroService.criarMovimentacao(createMovimentacaoDto);
  }

  @Get('movimentacoes')
  listarMovimentacoes(@Query() filtros: any) {
    return this.financeiroService.listarMovimentacoes(filtros);
  }

  @Get('fluxo-caixa')
  obterFluxoCaixa(@Query('periodo') periodo?: string) {
    return this.financeiroService.obterFluxoCaixa(periodo);
  }

  @Get('resumo')
  obterResumoFinanceiro() {
    return this.financeiroService.obterResumoFinanceiro();
  }
}








