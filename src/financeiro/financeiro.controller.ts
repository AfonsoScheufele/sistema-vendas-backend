import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FinanceiroService } from './financeiro.service';
import { CreateContaReceberDto } from './dto/create-conta-receber.dto';
import { StatusReceber } from './conta-receber.interface';
import { StatusPagar } from './conta-pagar.interface';
import { CreateContaPagarDto } from './dto/create-conta-pagar.dto';
import { CreateInvestimentoCarteiraDto } from './dto/create-investimento-carteira.dto';
import { UpdateInvestimentoCarteiraDto } from './dto/update-investimento-carteira.dto';
import { CreateInvestimentoAtivoDto } from './dto/create-investimento-ativo.dto';
import { UpdateInvestimentoAtivoDto } from './dto/update-investimento-ativo.dto';
import { CreateInvestimentoHistoricoDto } from './dto/create-investimento-historico.dto';
import { CreateInvestimentoAlertaDto } from './dto/create-investimento-alerta.dto';
import { CreateOrcamentoCentroDto } from './dto/create-orcamento-centro.dto';
import { UpdateOrcamentoCentroDto } from './dto/update-orcamento-centro.dto';
import { CreateOrcamentoMetaDto } from './dto/create-orcamento-meta.dto';
import { UpdateOrcamentoMetaDto } from './dto/update-orcamento-meta.dto';
import { CreateOrcamentoAlertaDto } from './dto/create-orcamento-alerta.dto';

@Controller('financeiro')
@UseGuards(JwtAuthGuard)
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Get('receber')
  async listarContasReceber(
    @Req() req: any,
    @Query('status') status?: StatusReceber | 'todas',
    @Query('search') search?: string,
  ) {
    return this.financeiroService.listarContasReceber(req.empresaId, { status, search });
  }

  @Get('receber/stats')
  async obterEstatisticasReceber(@Req() req: any) {
    return this.financeiroService.obterEstatisticas(req.empresaId);
  }

  @Get('receber/:id')
  async obterContaReceber(@Param('id') id: string, @Req() req: any) {
    return this.financeiroService.obterConta(req.empresaId, id);
  }

  @Post('receber')
  async criarContaReceber(@Body() dto: CreateContaReceberDto, @Req() req: any) {
    return this.financeiroService.criarConta(dto, req.empresaId);
  }

  @Patch('receber/:id/status')
  async atualizarStatus(
    @Param('id') id: string,
    @Body('status') status: StatusReceber,
    @Body('valorPago') valorPago: number | undefined,
    @Body('pagamento') pagamento: string | undefined,
    @Req() req: any,
  ) {
    return this.financeiroService.atualizarStatus(req.empresaId, id, status, valorPago, pagamento);
  }

  @Patch('receber/:id')
  async atualizarConta(
    @Param('id') id: string,
    @Body() dto: Partial<CreateContaReceberDto>,
    @Req() req: any,
  ) {
    return this.financeiroService.atualizarConta(req.empresaId, id, dto);
  }

  @Delete('receber/:id')
  async removerConta(@Param('id') id: string, @Req() req: any) {
    this.financeiroService.removerConta(req.empresaId, id);
    return { sucesso: true };
  }

  @Get('pagar')
  async listarContasPagar(
    @Req() req: any,
    @Query('status') status?: StatusPagar | 'todas',
    @Query('search') search?: string,
  ) {
    return this.financeiroService.listarContasPagar(req.empresaId, { status, search });
  }

  @Get('pagar/stats')
  async obterEstatisticasPagar(@Req() req: any) {
    return this.financeiroService.obterEstatisticasPagar(req.empresaId);
  }

  @Get('pagar/:id')
  async obterContaPagar(@Param('id') id: string, @Req() req: any) {
    return this.financeiroService.obterContaPagar(req.empresaId, id);
  }

  @Post('pagar')
  async criarContaPagar(@Body() dto: CreateContaPagarDto, @Req() req: any) {
    return this.financeiroService.criarContaPagar(dto, req.empresaId);
  }

  @Patch('pagar/:id/status')
  async atualizarStatusPagar(
    @Param('id') id: string,
    @Body('status') status: StatusPagar,
    @Body('valorPago') valorPago: number | undefined,
    @Body('pagamento') pagamento: string | undefined,
    @Req() req: any,
  ) {
    return this.financeiroService.atualizarStatusPagar(req.empresaId, id, status, valorPago, pagamento);
  }

  @Patch('pagar/:id')
  async atualizarContaPagar(
    @Param('id') id: string,
    @Body() dto: Partial<CreateContaPagarDto>,
    @Req() req: any,
  ) {
    return this.financeiroService.atualizarContaPagar(req.empresaId, id, dto);
  }

  @Delete('pagar/:id')
  async removerContaPagar(@Param('id') id: string, @Req() req: any) {
    this.financeiroService.removerContaPagar(req.empresaId, id);
    return { sucesso: true };
  }

  @Get('fluxo-caixa')
  async listarFluxoCaixa(@Req() req: any, @Query('dias') dias?: string) {
    const diasNumero = dias ? Number(dias) : undefined;
    return this.financeiroService.obterFluxoCaixa(req.empresaId, diasNumero);
  }

  @Get('bancos')
  async listarBancos(@Req() req: any) {
    return this.financeiroService.listarContasBancarias(req.empresaId);
  }

  @Get('conciliacao')
  async listarConciliacao(@Req() req: any) {
    return this.financeiroService.obterConsolidadoConcilicao(req.empresaId);
  }

  @Get('investimentos')
  async listarInvestimentos(@Req() req: any) {
    return this.financeiroService.obterInvestimentos(req.empresaId);
  }

  @Get('investimentos/carteiras')
  async listarCarteiras(@Req() req: any) {
    return this.financeiroService.listarCarteirasInvestimento(req.empresaId);
  }

  @Post('investimentos/carteiras')
  async criarCarteira(
    @Req() req: any,
    @Body() dto: CreateInvestimentoCarteiraDto,
  ) {
    return this.financeiroService.criarCarteiraInvestimento(req.empresaId, dto);
  }

  @Patch('investimentos/carteiras/:id')
  async atualizarCarteira(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateInvestimentoCarteiraDto,
  ) {
    return this.financeiroService.atualizarCarteiraInvestimento(req.empresaId, id, dto);
  }

  @Delete('investimentos/carteiras/:id')
  async removerCarteira(@Param('id') id: string, @Req() req: any) {
    await this.financeiroService.removerCarteiraInvestimento(req.empresaId, id);
    return { sucesso: true };
  }

  @Post('investimentos/ativos')
  async criarAtivo(@Req() req: any, @Body() dto: CreateInvestimentoAtivoDto) {
    return this.financeiroService.criarAtivoInvestimento(req.empresaId, dto);
  }

  @Patch('investimentos/ativos/:id')
  async atualizarAtivo(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateInvestimentoAtivoDto,
  ) {
    return this.financeiroService.atualizarAtivoInvestimento(req.empresaId, id, dto);
  }

  @Delete('investimentos/ativos/:id')
  async removerAtivo(@Param('id') id: string, @Req() req: any) {
    await this.financeiroService.removerAtivoInvestimento(req.empresaId, id);
    return { sucesso: true };
  }

  @Post('investimentos/historico')
  async criarHistorico(
    @Req() req: any,
    @Body() dto: CreateInvestimentoHistoricoDto,
  ) {
    return this.financeiroService.criarHistoricoInvestimento(req.empresaId, dto);
  }

  @Delete('investimentos/historico/:id')
  async removerHistorico(@Param('id') id: string, @Req() req: any) {
    await this.financeiroService.removerHistoricoInvestimento(req.empresaId, id);
    return { sucesso: true };
  }

  @Post('investimentos/alertas')
  async criarAlertaInvestimento(
    @Req() req: any,
    @Body() dto: CreateInvestimentoAlertaDto,
  ) {
    return this.financeiroService.criarAlertaInvestimento(req.empresaId, dto);
  }

  @Delete('investimentos/alertas/:id')
  async removerAlertaInvestimento(@Param('id') id: string, @Req() req: any) {
    await this.financeiroService.removerAlertaInvestimento(req.empresaId, id);
    return { sucesso: true };
  }

  @Get('orcamento')
  async listarOrcamento(@Req() req: any) {
    return this.financeiroService.obterOrcamento(req.empresaId);
  }

  @Get('orcamento/linhas')
  async listarOrcamentoLinhas(@Req() req: any) {
    return this.financeiroService.listarOrcamentoLinhas(req.empresaId);
  }

  @Post('orcamento/linhas')
  async criarOrcamentoLinha(
    @Req() req: any,
    @Body() dto: CreateOrcamentoCentroDto,
  ) {
    return this.financeiroService.criarOrcamentoLinha(req.empresaId, dto);
  }

  @Patch('orcamento/linhas/:id')
  async atualizarOrcamentoLinha(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateOrcamentoCentroDto,
  ) {
    return this.financeiroService.atualizarOrcamentoLinha(req.empresaId, id, dto);
  }

  @Delete('orcamento/linhas/:id')
  async removerOrcamentoLinha(@Param('id') id: string, @Req() req: any) {
    await this.financeiroService.removerOrcamentoLinha(req.empresaId, id);
    return { sucesso: true };
  }

  @Post('orcamento/metas')
  async criarOrcamentoMeta(@Req() req: any, @Body() dto: CreateOrcamentoMetaDto) {
    return this.financeiroService.criarOrcamentoMeta(req.empresaId, dto);
  }

  @Patch('orcamento/metas/:id')
  async atualizarOrcamentoMeta(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateOrcamentoMetaDto,
  ) {
    return this.financeiroService.atualizarOrcamentoMeta(req.empresaId, id, dto);
  }

  @Delete('orcamento/metas/:id')
  async removerOrcamentoMeta(@Param('id') id: string, @Req() req: any) {
    await this.financeiroService.removerOrcamentoMeta(req.empresaId, id);
    return { sucesso: true };
  }

  @Post('orcamento/alertas')
  async criarOrcamentoAlerta(
    @Req() req: any,
    @Body() dto: CreateOrcamentoAlertaDto,
  ) {
    return this.financeiroService.criarOrcamentoAlerta(req.empresaId, dto);
  }

  @Delete('orcamento/alertas/:id')
  async removerOrcamentoAlerta(@Param('id') id: string, @Req() req: any) {
    await this.financeiroService.removerOrcamentoAlerta(req.empresaId, id);
    return { sucesso: true };
  }

  @Get('bancos/resumo')
  async obterResumoBancario(@Req() req: any) {
    return this.financeiroService.obterDashboardBancos(req.empresaId);
  }

  @Get('tesouraria')
  async obterTesouraria(@Req() req: any) {
    return this.financeiroService.obterTesouraria(req.empresaId);
  }
}














