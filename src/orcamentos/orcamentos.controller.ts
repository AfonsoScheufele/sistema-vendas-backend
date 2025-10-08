import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { OrcamentosService } from './orcamentos.service';
import { CreateOrcamentoDto } from './dto/create-orcamento.dto';
import { UpdateOrcamentoDto } from './dto/update-orcamento.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('orcamentos')
@UseGuards(JwtAuthGuard)
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrcamentoDto: CreateOrcamentoDto) {
    return this.orcamentosService.create(createOrcamentoDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.orcamentosService.findAll(status);
  }

  @Get('stats')
  getStats() {
    return this.orcamentosService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orcamentosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrcamentoDto: UpdateOrcamentoDto) {
    return this.orcamentosService.update(+id, updateOrcamentoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.orcamentosService.remove(+id);
  }

  @Post(':id/converter')
  @HttpCode(HttpStatus.CREATED)
  converterEmPedido(@Param('id') id: string) {
    return this.orcamentosService.converterEmPedido(+id);
  }
}