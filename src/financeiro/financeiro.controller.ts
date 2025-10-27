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
}

