import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  async listarPedidos(@Query('status') status?: string) {
    return await this.pedidosService.listarPedidos(status);
  }

  @Get('stats')
  async obterEstatisticas() {
    return await this.pedidosService.obterEstatisticas();
  }

  @Get(':id')
  async obterPedido(@Param('id') id: string) {
    return await this.pedidosService.obterPedido(+id);
  }

  @Post()
  async criar(@Body() data: any) {
    return await this.pedidosService.criar(data);
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() data: any) {
    return await this.pedidosService.atualizar(+id, data);
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    return await this.pedidosService.excluir(+id);
  }
}




