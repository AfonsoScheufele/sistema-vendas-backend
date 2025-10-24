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

  
  @Get('investimentos')
  listarInvestimentos(@Query() filtros: any) {
    return this.financeiroService.listarInvestimentos(filtros);
  }

  @Post('investimentos')
  @HttpCode(HttpStatus.CREATED)
  criarInvestimento(@Body() createInvestimentoDto: any) {
    return this.financeiroService.criarInvestimento(createInvestimentoDto);
  }

  @Get('investimentos/:id')
  obterInvestimento(@Param('id') id: string) {
    return this.financeiroService.obterInvestimento(+id);
  }

  @Patch('investimentos/:id')
  atualizarInvestimento(@Param('id') id: string, @Body() updateInvestimentoDto: any) {
    return this.financeiroService.atualizarInvestimento(+id, updateInvestimentoDto);
  }

  @Patch('investimentos/:id/resgatar')
  resgatarInvestimento(@Param('id') id: string, @Body() resgateDto: any) {
    return this.financeiroService.resgatarInvestimento(+id, resgateDto);
  }

  @Delete('investimentos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerInvestimento(@Param('id') id: string) {
    return this.financeiroService.removerInvestimento(+id);
  }

  
  @Get('orcamentos')
  listarOrcamentos(@Query() filtros: any) {
    return this.financeiroService.listarOrcamentos(filtros);
  }

  @Post('orcamentos')
  @HttpCode(HttpStatus.CREATED)
  criarOrcamento(@Body() createOrcamentoDto: any) {
    return this.financeiroService.criarOrcamento(createOrcamentoDto);
  }

  @Get('orcamentos/:id')
  obterOrcamento(@Param('id') id: string) {
    return this.financeiroService.obterOrcamento(+id);
  }

  @Patch('orcamentos/:id')
  atualizarOrcamento(@Param('id') id: string, @Body() updateOrcamentoDto: any) {
    return this.financeiroService.atualizarOrcamento(+id, updateOrcamentoDto);
  }

  @Patch('orcamentos/:id/gastar')
  registrarGasto(@Param('id') id: string, @Body() gastoDto: any) {
    return this.financeiroService.registrarGasto(+id, gastoDto);
  }

  @Delete('orcamentos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerOrcamento(@Param('id') id: string) {
    return this.financeiroService.removerOrcamento(+id);
  }

  
  @Get('relatorios/investimentos')
  obterRelatorioInvestimentos(@Query() filtros: any) {
    return this.financeiroService.obterRelatorioInvestimentos(filtros);
  }

  @Get('relatorios/orcamentos')
  obterRelatorioOrcamentos(@Query() filtros: any) {
    return this.financeiroService.obterRelatorioOrcamentos(filtros);
  }
}










