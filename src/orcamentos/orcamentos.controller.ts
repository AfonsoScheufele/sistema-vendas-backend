import { Controller, Get, Post, Patch, Delete, UseGuards, Body, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrcamentosService } from './orcamentos.service';

@Controller('orcamentos')
@UseGuards(JwtAuthGuard)
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Get()
  async listarOrcamentos() {
    return await this.orcamentosService.listarOrcamentos();
  }

  @Get('stats')
  async obterEstatisticas() {
    return await this.orcamentosService.obterEstatisticas();
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: number) {
    return await this.orcamentosService.buscarPorId(id);
  }

  @Post()
  async criar(@Body() data: any) {
    return await this.orcamentosService.criar(data);
  }

  @Patch(':id')
  async atualizar(@Param('id') id: number, @Body() data: any) {
    return await this.orcamentosService.atualizar(id, data);
  }

  @Delete(':id')
  async excluir(@Param('id') id: number) {
    return await this.orcamentosService.excluir(id);
  }

  @Post(':id/converter')
  async converterEmPedido(@Param('id') id: number) {
    return await this.orcamentosService.converterEmPedido(id);
  }
}




