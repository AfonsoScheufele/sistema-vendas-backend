import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrcamentosService } from './orcamentos.service';

@Controller('orcamentos')
@UseGuards(JwtAuthGuard)
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Get()
  async listarOrcamentos() {
    return await this.orcamentosService.listarOrcamentos();
  }

  @Get('stats')
  async obterEstatisticas() {
    return await this.orcamentosService.obterEstatisticas();
  }
}

