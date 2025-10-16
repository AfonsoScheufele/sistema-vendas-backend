import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  
  @Get('dashboard')
  getDashboard() {
    return {
      totalVendas: 0,
      clientesAtivos: 4,
      produtosEstoque: 5,
      pedidosPendentes: 0,
      faturamentoMes: 0,
      crescimentoVendas: 0,
      ticketMedio: 0,
      conversao: 0
    };
  }

  @Get('stats')
  getStats() {
    return {
      message: 'Teste funcionando!',
      timestamp: new Date().toISOString()
    };
  }
}

