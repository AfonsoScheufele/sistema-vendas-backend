import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('Admin', 'Gerente')
  async list() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @Roles('Admin', 'Gerente')
  async permissions() {
    return this.rolesService.listAvailablePermissions();
  }

  @Get(':id')
  @Roles('Admin', 'Gerente')
  async get(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Post()
  @Roles('Admin')
  async create(@Body() body: any) {
    return this.rolesService.create(body);
  }

  @Put(':id')
  @Roles('Admin')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.rolesService.update(+id, body);
  }

  @Delete(':id')
  @Roles('Admin')
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(+id);
    return { success: true };
  }
}


