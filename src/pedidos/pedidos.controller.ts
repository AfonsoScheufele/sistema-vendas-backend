import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  async listarPedidos() {
    return await this.pedidosService.listarPedidos();
  }

  @Get('stats')
  async obterEstatisticas() {
    return await this.pedidosService.obterEstatisticas();
  }

  @Get(':id')
  async obterPedido(@Param('id') id: string) {
    return await this.pedidosService.obterPedido(+id);
  }
}



