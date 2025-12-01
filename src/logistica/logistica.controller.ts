import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LogisticaService } from './logistica.service';

@Controller('logistica')
@UseGuards(JwtAuthGuard)
export class LogisticaController {
  constructor(private readonly logisticaService: LogisticaService) {}

  @Get('expedicoes')
  async listarExpedicoes(@Req() req: any, @Query('status') status?: string) {
    return this.logisticaService.listarExpedicoes(req.empresaId, { status });
  }

  @Get('expedicoes/:id')
  async obterExpedicaoPorId(@Param('id') id: string, @Req() req: any) {
    return this.logisticaService.obterExpedicaoPorId(+id, req.empresaId);
  }

  @Post('expedicoes')
  async criarExpedicao(@Body() body: any, @Req() req: any) {
    return this.logisticaService.criarExpedicao(req.empresaId, body);
  }

  @Patch('expedicoes/:id')
  async atualizarExpedicao(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.logisticaService.atualizarExpedicao(+id, req.empresaId, body);
  }

  @Get('rastrear/:codigo')
  async rastrearExpedicao(@Param('codigo') codigo: string, @Req() req: any) {
    return this.logisticaService.rastrearExpedicao(codigo, req.empresaId);
  }

  @Get('transportadoras')
  async listarTransportadoras(@Req() req: any, @Query('status') status?: string) {
    return this.logisticaService.listarTransportadoras(req.empresaId, { status });
  }

  @Post('transportadoras')
  async criarTransportadora(@Body() body: any, @Req() req: any) {
    return this.logisticaService.criarTransportadora(req.empresaId, body);
  }

  @Patch('transportadoras/:id')
  async atualizarTransportadora(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.logisticaService.atualizarTransportadora(+id, req.empresaId, body);
  }

  @Get('roteiros')
  async listarRoteiros(@Req() req: any, @Query('status') status?: string) {
    return this.logisticaService.listarRoteiros(req.empresaId, { status });
  }

  @Get('roteiros/stats')
  async obterStatsRoteiros(@Req() req: any) {
    return this.logisticaService.obterStatsRoteiros(req.empresaId);
  }

  @Post('roteiros')
  async criarRoteiro(@Body() body: any, @Req() req: any) {
    return this.logisticaService.criarRoteiro(req.empresaId, body);
  }

  @Patch('roteiros/:id')
  async atualizarRoteiro(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.logisticaService.atualizarRoteiro(+id, req.empresaId, body);
  }
}





















