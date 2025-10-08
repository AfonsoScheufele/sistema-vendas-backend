import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { RequisicoesService } from './requisicoes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('compras/requisicoes')
@UseGuards(JwtAuthGuard)
export class RequisicoesController {
  constructor(private readonly requisicoesService: RequisicoesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRequisicaoDto: any) {
    return this.requisicoesService.create(createRequisicaoDto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('prioridade') prioridade?: string) {
    return this.requisicoesService.findAll({ status, prioridade });
  }

  @Get('stats')
  getStats() {
    return this.requisicoesService.obterStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisicoesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequisicaoDto: any) {
    return this.requisicoesService.update(+id, updateRequisicaoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.requisicoesService.remove(+id);
  }

  @Patch(':id/aprovar')
  @HttpCode(HttpStatus.OK)
  aprovar(@Param('id') id: string) {
    return this.requisicoesService.aprovar(+id);
  }

  @Patch(':id/rejeitar')
  @HttpCode(HttpStatus.OK)
  rejeitar(@Param('id') id: string, @Body() body: { motivo: string }) {
    return this.requisicoesService.rejeitar(+id, body.motivo);
  }
}
