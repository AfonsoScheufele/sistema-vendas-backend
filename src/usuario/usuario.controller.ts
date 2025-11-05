import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsuarioService } from './usuario.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  async findAll() {
    return this.usuarioService.findAll();
  }

  @Post()
  async create(@Body() body: { name: string; cpf: string; email?: string; senha: string; role?: string }) {
    return this.usuarioService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; email?: string; role?: string; ativo?: boolean }
  ) {
    return this.usuarioService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usuarioService.remove(id);
    return { message: 'Usuário excluído com sucesso' };
  }
}
