import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GruposVendedoresService, CreateGrupoVendedoresDto, UpdateGrupoVendedoresDto } from './grupos-vendedores.service';

@Controller('grupos-vendedores')
@UseGuards(JwtAuthGuard)
export class GruposVendedoresController {
  constructor(private readonly gruposVendedoresService: GruposVendedoresService) {}

  @Get()
  async listar(@Req() req: any) {
    return await this.gruposVendedoresService.listar(req.empresaId);
  }

  @Get(':id')
  async obter(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return await this.gruposVendedoresService.obterPorId(req.empresaId, id);
  }

  @Post()
  async criar(@Body() dto: CreateGrupoVendedoresDto, @Req() req: any) {
    return await this.gruposVendedoresService.criar(req.empresaId, dto);
  }

  @Put(':id')
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGrupoVendedoresDto,
    @Req() req: any,
  ) {
    return await this.gruposVendedoresService.atualizar(req.empresaId, id, dto);
  }

  @Delete(':id')
  async remover(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.gruposVendedoresService.remover(req.empresaId, id);
    return { message: 'Grupo removido com sucesso' };
  }

  @Get(':id/estatisticas')
  async obterEstatisticas(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return await this.gruposVendedoresService.obterEstatisticas(
      req.empresaId,
      id,
      req.user.id,
      req.query.dataInicio,
      req.query.dataFim,
    );
  }

  @Post(':id/verificar-notificacoes')
  async verificarNotificacoes(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return await this.gruposVendedoresService.verificarENotificarGerente(req.empresaId, id);
  }
}

