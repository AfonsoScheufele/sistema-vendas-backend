import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('financeiro')
@UseGuards(JwtAuthGuard)
export class FinanceiroController {
  @Get('receber')
  async listarContasReceber() {
    return [];
  }

  @Get('pagar')
  async listarContasPagar() {
    return [];
  }

  @Get('fluxo-caixa')
  async listarFluxoCaixa() {
    return [];
  }

  @Get('bancos')
  async listarBancos() {
    return [];
  }

  @Get('conciliacao')
  async listarConciliacao() {
    return [];
  }

  @Get('investimentos')
  async listarInvestimentos() {
    return [];
  }

  @Get('orcamento')
  async listarOrcamento() {
    return [];
  }
}

