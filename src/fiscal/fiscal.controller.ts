import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { FiscalService } from './fiscal.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('fiscal')
@UseGuards(JwtAuthGuard)
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  @Post('notas-fiscais')
  @HttpCode(HttpStatus.CREATED)
  criarNotaFiscal(@Body() createNotaFiscalDto: any) {
    return this.fiscalService.criarNotaFiscal(createNotaFiscalDto);
  }

  @Get('notas-fiscais')
  listarNotasFiscais(@Query() filtros: any) {
    return this.fiscalService.listarNotasFiscais(filtros);
  }

  @Get('notas-fiscais/stats')
  obterResumoFiscal() {
    return this.fiscalService.obterResumoFiscal();
  }

  @Get('notas-fiscais/:id')
  obterNotaFiscal(@Param('id') id: string) {
    return this.fiscalService.obterNotaFiscal(+id);
  }

  @Patch('notas-fiscais/:id/emitir')
  @HttpCode(HttpStatus.OK)
  emitirNotaFiscal(@Param('id') id: string) {
    return this.fiscalService.emitirNotaFiscal(+id);
  }

  @Patch('notas-fiscais/:id/autorizar')
  @HttpCode(HttpStatus.OK)
  autorizarNotaFiscal(@Param('id') id: string) {
    return this.fiscalService.autorizarNotaFiscal(+id);
  }

  @Patch('notas-fiscais/:id/cancelar')
  @HttpCode(HttpStatus.OK)
  cancelarNotaFiscal(@Param('id') id: string, @Body() body: { motivo: string }) {
    return this.fiscalService.cancelarNotaFiscal(+id, body.motivo);
  }

  @Get('notas-fiscais/:id/xml')
  gerarXML(@Param('id') id: string) {
    return this.fiscalService.gerarXML(+id);
  }

  @Get('notas-fiscais/:id/pdf')
  gerarPDF(@Param('id') id: string) {
    return this.fiscalService.gerarPDF(+id);
  }
}


