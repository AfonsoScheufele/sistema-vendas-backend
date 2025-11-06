import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CrmService } from './crm.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('crm/leads')
  async listarLeads() {
    return await this.crmService.listarLeads();
  }

  @Get('crm/leads/stats')
  async obterStatsLeads() {
    const naoConvertidos = await this.crmService.contarLeadsNaoConvertidos();
    return { total: 0, naoConvertidos, qualificados: 0, convertidos: 0, taxaConversao: 0 };
  }

  @Get('oportunidades')
  async listarOportunidades() {
    return await this.crmService.listarOportunidades();
  }

  @Get('oportunidades/stats')
  async obterStatsOportunidades() {
    const ativas = await this.crmService.contarOportunidadesAtivas();
    return { total: 0, ativas, fechadas: 0, taxaFechamento: 0 };
  }

  @Get('campanhas')
  async listarCampanhas() {
    return await this.crmService.listarCampanhas();
  }

  @Get('campanhas/stats')
  async obterStatsCampanhas() {
    const ativas = await this.crmService.contarCampanhasAtivas();
    return { total: 0, ativas, pausadas: 0, concluidas: 0 };
  }

  @Get('pipeline')
  async listarPipeline() {
    return await this.crmService.listarOportunidades();
  }
}
