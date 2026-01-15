import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CrmService } from './crm.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('crm/leads')
  async listarLeads(@Req() req: any) {
    return await this.crmService.listarLeads(req.empresaId);
  }

  @Get('crm/leads/stats')
  async obterStatsLeads(@Req() req: any) {
    const naoConvertidos = await this.crmService.contarLeadsNaoConvertidos(req.empresaId);
    const total = await this.crmService.listarLeads(req.empresaId);
    const qualificados = total.filter((l) => l.status === 'qualificado').length;
    const convertidos = total.filter((l) => l.status === 'convertido').length;
    const taxaConversao = total.length > 0 ? (convertidos / total.length) * 100 : 0;
    return { total: total.length, novos: naoConvertidos, qualificados, convertidos, taxaConversao };
  }

  @Get('crm/leads/:id')
  async buscarLeadPorId(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return await this.crmService.buscarLeadPorId(id, req.empresaId);
  }

  @Post('crm/leads')
  @HttpCode(HttpStatus.CREATED)
  async criarLead(@Body() createLeadDto: CreateLeadDto, @Req() req: any) {
    return await this.crmService.criarLead(createLeadDto, req.empresaId);
  }

  @Patch('crm/leads/:id')
  async atualizarLead(@Param('id', ParseIntPipe) id: number, @Body() updateLeadDto: UpdateLeadDto, @Req() req: any) {
    return await this.crmService.atualizarLead(id, updateLeadDto, req.empresaId);
  }

  @Patch('crm/leads/:id/status')
  async atualizarStatusLead(@Param('id', ParseIntPipe) id: number, @Body('status') status: string, @Req() req: any) {
    return await this.crmService.atualizarStatusLead(id, status, req.empresaId);
  }

  @Delete('crm/leads/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirLead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.crmService.excluirLead(id, req.empresaId);
  }

  @Get('oportunidades')
  async listarOportunidades(@Req() req: any) {
    return await this.crmService.listarOportunidades(req.empresaId);
  }

  @Get('oportunidades/stats')
  async obterStatsOportunidades(@Req() req: any) {
    const ativas = await this.crmService.contarOportunidadesAtivas(req.empresaId);
    const total = await this.crmService.listarOportunidades(req.empresaId);
    const fechadas = total.filter((o) => o.status === 'fechada').length;
    const taxaFechamento = total.length > 0 ? (fechadas / total.length) * 100 : 0;
    return { total: total.length, ativas, fechadas, taxaFechamento };
  }

  @Get('campanhas')
  async listarCampanhas(@Req() req: any) {
    return await this.crmService.listarCampanhas(req.empresaId);
  }

  @Get('campanhas/stats')
  async obterStatsCampanhas(@Req() req: any) {
    const ativas = await this.crmService.contarCampanhasAtivas(req.empresaId);
    const total = await this.crmService.listarCampanhas(req.empresaId);
    const pausadas = total.filter((c) => c.status === 'pausada').length;
    const concluidas = total.filter((c) => c.status === 'concluida').length;
    return { total: total.length, ativas, pausadas, concluidas };
  }

  @Get('pipeline')
  async listarPipeline(@Req() req: any) {
    return await this.crmService.listarOportunidades(req.empresaId);
  }

  // Campanhas de Email
  @Get('crm/campanhas-email')
  async listarCampanhasEmail(@Req() req: any) {
    return await this.crmService.listarCampanhasEmail(req.empresaId);
  }

  @Get('crm/campanhas-email/:id')
  async buscarCampanhaEmailPorId(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return await this.crmService.buscarCampanhaEmailPorId(id, req.empresaId);
  }

  @Post('crm/campanhas-email')
  @HttpCode(HttpStatus.CREATED)
  async criarCampanhaEmail(@Body() body: any, @Req() req: any) {
    return await this.crmService.criarCampanhaEmail(body, req.empresaId);
  }

  @Patch('crm/campanhas-email/:id')
  async atualizarCampanhaEmail(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    return await this.crmService.atualizarCampanhaEmail(id, body, req.empresaId);
  }

  @Delete('crm/campanhas-email/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirCampanhaEmail(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.crmService.excluirCampanhaEmail(id, req.empresaId);
  }
}
