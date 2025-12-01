import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ModulosService } from './modulos.service';

@Controller('modulos')
@UseGuards(JwtAuthGuard)
export class ModulosController {
  constructor(private readonly modulosService: ModulosService) {}

  @Get()
  async listarModulosDisponiveis() {
    return this.modulosService.listarModulosDisponiveis();
  }

  @Get('habilitados')
  async obterModulosHabilitados(@Req() req: any) {
    return this.modulosService.obterModulosHabilitados(req.empresaId);
  }

  @Get('habilitados/codigos')
  async obterCodigosModulosHabilitados(@Req() req: any) {
    return this.modulosService.obterCodigosModulosHabilitados(req.empresaId);
  }

  @Get('verificar/:codigo')
  async verificarModuloHabilitado(@Req() req: any, @Param('codigo') codigo: string) {
    const habilitado = await this.modulosService.verificarModuloHabilitado(req.empresaId, codigo);
    return { codigo, habilitado };
  }

  @Post('habilitar/:codigo')
  async habilitarModulo(
    @Req() req: any,
    @Param('codigo') codigo: string,
    @Body() body?: { configuracoes?: Record<string, any> },
  ) {
    return this.modulosService.habilitarModulo(req.empresaId, codigo, body?.configuracoes);
  }

  @Post('desabilitar/:codigo')
  async desabilitarModulo(@Req() req: any, @Param('codigo') codigo: string) {
    await this.modulosService.desabilitarModulo(req.empresaId, codigo);
    return { message: 'Módulo desabilitado com sucesso' };
  }

  @Patch('configuracao/:codigo')
  async atualizarConfiguracaoModulo(
    @Req() req: any,
    @Param('codigo') codigo: string,
    @Body() configuracoes: Record<string, any>,
  ) {
    return this.modulosService.atualizarConfiguracaoModulo(req.empresaId, codigo, configuracoes);
  }

  @Get('configuracao/:codigo')
  async obterConfiguracaoModulo(@Req() req: any, @Param('codigo') codigo: string) {
    return this.modulosService.obterConfiguracaoModulo(req.empresaId, codigo);
  }
}

