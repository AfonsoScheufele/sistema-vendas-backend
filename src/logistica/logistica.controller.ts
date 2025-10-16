import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { LogisticaService } from './logistica.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('logistica')
@UseGuards(JwtAuthGuard)
export class LogisticaController {
  constructor(private readonly logisticaService: LogisticaService) {}

  @Post('transportadoras')
  @HttpCode(HttpStatus.CREATED)
  criarTransportadora(@Body() createTransportadoraDto: any) {
    return this.logisticaService.criarTransportadora(createTransportadoraDto);
  }

  @Get('transportadoras')
  listarTransportadoras() {
    return this.logisticaService.listarTransportadoras();
  }

  @Get('transportadoras/:id')
  obterTransportadora(@Param('id') id: string) {
    return this.logisticaService.obterTransportadora(+id);
  }

  @Post('expedicoes')
  @HttpCode(HttpStatus.CREATED)
  criarExpedicao(@Body() createExpedicaoDto: any) {
    return this.logisticaService.criarExpedicao(createExpedicaoDto);
  }

  @Get('expedicoes')
  listarExpedicoes(@Query() filtros: any) {
    return this.logisticaService.listarExpedicoes(filtros);
  }

  @Get('expedicoes/resumo')
  obterResumoLogistica() {
    return this.logisticaService.obterResumoLogistica();
  }

  @Patch('expedicoes/:id/status')
  @HttpCode(HttpStatus.OK)
  atualizarStatusExpedicao(@Param('id') id: string, @Body() body: { status: string }) {
    return this.logisticaService.atualizarStatusExpedicao(+id, body.status as any);
  }
}





