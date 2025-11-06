import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PerfisService } from './perfis.service';

@Controller('perfis')
@UseGuards(JwtAuthGuard)
export class PerfisController {
  constructor(private readonly perfisService: PerfisService) {}

  @Get()
  async findAll() {
    const perfis = await this.perfisService.findAll();
    const perfisComContagem = await Promise.all(perfis.map(async perfil => ({
      ...perfil,
      usuariosVinculados: await this.perfisService.countUsuariosVinculados(perfil.id),
    })));
    return perfisComContagem;
  }

  @Get('all')
  async findAllWithInactive() {
    return this.perfisService.findAllWithInactive();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const perfil = await this.perfisService.findOne(id);
    const usuariosVinculados = await this.perfisService.countUsuariosVinculados(id);
    return { ...perfil, usuariosVinculados };
  }

  @Post()
  async create(@Body() body: { nome: string; descricao?: string; permissoes?: string[]; cor?: string }) {
    return this.perfisService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nome?: string; descricao?: string; permissoes?: string[]; cor?: string; ativo?: boolean }
  ) {
    return this.perfisService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.perfisService.remove(id);
    return { message: 'Perfil excluído com sucesso' };
  }
}

