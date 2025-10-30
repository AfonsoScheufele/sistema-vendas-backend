import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsuarioService } from './usuario.service';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { RolesService } from '../roles/roles.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly rolesService: RolesService
  ) {}

  @Get()
  @Roles('Admin', 'Gerente')
  async findAll() {
    return this.usuarioService.findAll();
  }

  @Get('roles/list')
  @UseGuards(JwtAuthGuard)
  async getRoles() {
    const roles = await this.rolesService.findAll();
    return roles.map(role => ({
      value: role.slug,
      label: role.name,
      description: role.description,
      permissions: Array.isArray(role.permissions) ? role.permissions : JSON.parse(role.permissions || '[]')
    }));
  }

  @Get(':id')
  @Roles('Admin', 'Gerente')
  async findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(+id);
  }

  @Post()
  @Roles('Admin')
  async create(@Body() createUsuarioDto: any) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Put(':id')
  @Roles('Admin', 'Gerente')
  async update(@Param('id') id: string, @Body() updateUsuarioDto: any) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles('Admin')
  async remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }

  @Patch(':id/status')
  @Roles('Admin', 'Gerente')
  async toggleStatus(@Param('id') id: string) {
    return this.usuarioService.toggleStatus(+id);
  }
}


