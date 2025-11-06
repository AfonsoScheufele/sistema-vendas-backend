import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ComissoesService } from './comissoes.service';

@Controller('comissoes')
@UseGuards(JwtAuthGuard)
export class ComissoesController {
  constructor(private readonly comissoesService: ComissoesService) {}

  @Get()
  async listar() {
    return await this.comissoesService.listar();
  }
}

@Controller('metas')
@UseGuards(JwtAuthGuard)
export class MetasController {
  @Get()
  async listarMetas() {
    return [];
  }

  @Get('stats')
  async obterStatsMetas() {
    return { total: 0, ativas: 0, concluidas: 0, pendentes: 0 };
  }
}

