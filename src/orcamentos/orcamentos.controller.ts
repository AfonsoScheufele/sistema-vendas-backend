import { Controller, Get, Post, Patch, Delete, UseGuards, Body, Param, Query, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrcamentosService } from './orcamentos.service';

@Controller('orcamentos')
@UseGuards(JwtAuthGuard)
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Get()
  async listarOrcamentos(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.orcamentosService.listarOrcamentos(req.empresaId, { status, search });
  }

  @Get('stats')
  async obterEstatisticas(@Req() req: any) {
    return this.orcamentosService.obterEstatisticas(req.empresaId);
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: number, @Req() req: any) {
    return this.orcamentosService.buscarPorId(id, req.empresaId);
  }

  @Post()
  async criar(@Body() data: any, @Req() req: any) {
    return this.orcamentosService.criar(req.empresaId, data);
  }

  @Patch(':id')
  async atualizar(@Param('id') id: number, @Body() data: any, @Req() req: any) {
    return this.orcamentosService.atualizar(id, req.empresaId, data);
  }

  @Delete(':id')
  async excluir(@Param('id') id: number, @Req() req: any) {
    return this.orcamentosService.excluir(id, req.empresaId);
  }

  @Post(':id/converter')
  async converterEmPedido(@Param('id') id: number, @Req() req: any) {
    return this.orcamentosService.converterEmPedido(id, req.empresaId);
  }
}
