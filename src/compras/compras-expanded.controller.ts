import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class ComprasExpandedController {
  @Get('cotacoes')
  async listarCotacoes() {
    return [];
  }

  @Get('cotacoes/stats')
  async obterStatsCotacoes() {
    return { total: 0, abertas: 0, fechadas: 0, canceladas: 0 };
  }

  @Get('compras/requisicoes')
  async listarRequisicoes() {
    return [];
  }

  @Get('compras/requisicoes/stats')
  async obterStatsRequisicoes() {
    return { total: 0, pendentes: 0, aprovadas: 0, rejeitadas: 0, valorTotal: 0 };
  }

  @Get('compras/pedidos')
  async listarPedidos() {
    return [];
  }

  @Get('compras/pedidos/stats')
  async obterStatsPedidos() {
    return { total: 0, rascunho: 0, enviado: 0, confirmado: 0, recebido: 0, cancelado: 0 };
  }

  @Get('fornecedores')
  async listarFornecedores() {
    return [];
  }

  @Get('fornecedores/stats')
  async obterStatsFornecedores() {
    return { total: 0, ativos: 0, inativos: 0 };
  }
}
