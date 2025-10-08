import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { OportunidadesService } from './oportunidades.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('oportunidades')
@UseGuards(JwtAuthGuard)
export class OportunidadesController {
  constructor(private readonly oportunidadesService: OportunidadesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOportunidadeDto: any) {
    return this.oportunidadesService.create(createOportunidadeDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.oportunidadesService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.oportunidadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOportunidadeDto: any) {
    return this.oportunidadesService.update(+id, updateOportunidadeDto);
  }

  @Post(':id/atividades')
  @HttpCode(HttpStatus.CREATED)
  adicionarAtividade(@Param('id') id: string, @Body() atividade: any) {
    return this.oportunidadesService.adicionarAtividade(+id, atividade);
  }

  @Patch(':id/fase')
  @HttpCode(HttpStatus.OK)
  atualizarFase(@Param('id') id: string, @Body() body: { fase: string }) {
    return this.oportunidadesService.atualizarFase(+id, body.fase as any);
  }

  @Patch(':id/ganhar')
  @HttpCode(HttpStatus.OK)
  ganhar(@Param('id') id: string) {
    return this.oportunidadesService.ganhar(+id);
  }

  @Patch(':id/perder')
  @HttpCode(HttpStatus.OK)
  perder(@Param('id') id: string, @Body() body: { motivo: string }) {
    return this.oportunidadesService.perder(+id, body.motivo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.oportunidadesService.remove(+id);
  }
}
