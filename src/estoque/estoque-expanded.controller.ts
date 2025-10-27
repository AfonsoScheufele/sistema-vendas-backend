import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class EstoqueExpandedController {
  @Get('estoque/transferencias')
  async listarTransferencias() {
    return [];
  }

  @Get('estoque/transferencias/stats')
  async obterStatsTransferencias() {
    return { total: 0, pendentes: 0, concluidas: 0 };
  }
}



