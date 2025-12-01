import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissoesService } from './permissoes.service';

@Controller('permissoes')
@UseGuards(JwtAuthGuard)
export class PermissoesController {
  constructor(private readonly permissoesService: PermissoesService) {}

  @Get()
  async listarPermissoes() {
    return this.permissoesService.listarPermissoes();
  }

  @Get('modulo/:moduloId')
  async listarPermissoesPorModulo(@Param('moduloId') moduloId: number) {
    return this.permissoesService.listarPermissoesPorModulo(moduloId);
  }

  @Get('perfil/:perfilId')
  async obterPermissoesDoPerfil(@Param('perfilId') perfilId: number) {
    const permissoes = await this.permissoesService.obterPermissoesDoPerfil(perfilId);
    return { perfilId, permissoes };
  }

  @Post('perfil/:perfilId')
  async atualizarPermissoesDoPerfil(
    @Param('perfilId') perfilId: number,
    @Body() body: { permissoes: string[] },
  ) {
    await this.permissoesService.atualizarPermissoesDoPerfil(perfilId, body.permissoes);
    return { message: 'Permissões atualizadas com sucesso' };
  }

  @Get('verificar/:perfilId/:codigo')
  async verificarPermissao(
    @Param('perfilId') perfilId: number,
    @Param('codigo') codigo: string,
  ) {
    const temPermissao = await this.permissoesService.verificarPermissao(perfilId, codigo);
    return { perfilId, codigo, temPermissao };
  }
}

