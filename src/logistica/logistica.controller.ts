import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class LogisticaController {
  @Get('roteiros')
  async listarRoteiros() {
    return [];
  }

  @Get('roteiros/stats')
  async obterStatsRoteiros() {
    return { total: 0, planejados: 0, em_execucao: 0, concluidos: 0 };
  }

  @Get('logistica/expedicao')
  async listarExpedicoes() {
    return [];
  }

  @Get('logistica/transportadoras')
  async listarTransportadoras() {
    return [];
  }
}




