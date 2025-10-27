import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class FiscalExpandedController {
  @Get('fiscal/notas-fiscais')
  async listarNotasFiscais() {
    return [];
  }

  @Get('fiscal/notas-fiscais/stats')
  async obterStatsNotasFiscais() {
    return { total: 0, emitidas: 0, canceladas: 0, valorTotal: 0 };
  }

  @Get('relatorios/clientes-distribuicao')
  async obterDistribuicaoClientes() {
    return [];
  }
}



