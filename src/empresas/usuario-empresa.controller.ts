import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsuarioEmpresaService, VincularUsuarioEmpresaDto } from './usuario-empresa.service';

@Controller('empresas/usuarios')
@UseGuards(JwtAuthGuard)
export class UsuarioEmpresaController {
  constructor(private readonly usuarioEmpresaService: UsuarioEmpresaService) {}

  @Post('vincular')
  vincular(@Body() dto: VincularUsuarioEmpresaDto) {
    return this.usuarioEmpresaService.vincularUsuarioEmpresa(dto);
  }

  @Delete('desvincular/:usuarioId/:empresaId')
  desvincular(
    @Param('usuarioId') usuarioId: string,
    @Param('empresaId') empresaId: string,
  ) {
    return this.usuarioEmpresaService.desvincularUsuarioEmpresa(+usuarioId, empresaId);
  }

  @Get('usuario/:usuarioId/empresas')
  listarEmpresasDoUsuario(@Param('usuarioId') usuarioId: string) {
    return this.usuarioEmpresaService.listarEmpresasDoUsuario(+usuarioId);
  }

  @Get('empresa/:empresaId/usuarios')
  listarUsuariosDaEmpresa(@Param('empresaId') empresaId: string) {
    return this.usuarioEmpresaService.listarUsuariosDaEmpresa(empresaId);
  }

  @Get('vinculo/:usuarioId/:empresaId')
  obterVinculo(
    @Param('usuarioId') usuarioId: string,
    @Param('empresaId') empresaId: string,
  ) {
    return this.usuarioEmpresaService.obterVinculo(+usuarioId, empresaId);
  }

  @Patch('permissoes/:usuarioId/:empresaId')
  atualizarPermissoes(
    @Param('usuarioId') usuarioId: string,
    @Param('empresaId') empresaId: string,
    @Body() body: { permissoes: string[] },
  ) {
    return this.usuarioEmpresaService.atualizarPermissoes(+usuarioId, empresaId, body.permissoes);
  }

  @Patch('papel/:usuarioId/:empresaId')
  atualizarPapel(
    @Param('usuarioId') usuarioId: string,
    @Param('empresaId') empresaId: string,
    @Body() body: { papel: string },
  ) {
    return this.usuarioEmpresaService.atualizarPapel(+usuarioId, empresaId, body.papel);
  }

  @Get('verificar-acesso/:usuarioId/:empresaId')
  verificarAcesso(
    @Param('usuarioId') usuarioId: string,
    @Param('empresaId') empresaId: string,
  ) {
    return this.usuarioEmpresaService.verificarAcesso(+usuarioId, empresaId);
  }

  @Get('permissoes/:usuarioId/:empresaId')
  obterPermissoes(
    @Param('usuarioId') usuarioId: string,
    @Param('empresaId') empresaId: string,
  ) {
    return this.usuarioEmpresaService.obterPermissoes(+usuarioId, empresaId);
  }
}

