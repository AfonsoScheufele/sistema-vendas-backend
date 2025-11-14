import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CrmService } from './crm.service';

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
    return { total: total.length, naoConvertidos, qualificados, convertidos, taxaConversao };
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
}
