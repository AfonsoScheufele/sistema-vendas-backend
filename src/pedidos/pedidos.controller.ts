import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  async listarPedidos(@Req() req: any, @Query('status') status?: string) {
    return this.pedidosService.listarPedidos(req.empresaId, status);
  }

  @Get('stats')
  async obterEstatisticas(@Req() req: any) {
    return this.pedidosService.obterEstatisticas(req.empresaId);
  }

  @Get('pipeline/snapshot')
  async obterPipeline(@Req() req: any) {
    return this.pedidosService.obterPipelineSnapshot(req.empresaId);
  }

  @Get(':id')
  async obterPedido(@Param('id') id: string, @Req() req: any) {
    return this.pedidosService.obterPedido(+id, req.empresaId);
  }

  @Post()
  async criar(@Body() data: any, @Req() req: any) {
    return this.pedidosService.criar(data, req.empresaId);
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.pedidosService.atualizar(+id, req.empresaId, data);
  }

  @Delete(':id')
  async excluir(@Param('id') id: string, @Req() req: any) {
    await this.pedidosService.excluir(+id, req.empresaId);
    return { sucesso: true };
  }
}
