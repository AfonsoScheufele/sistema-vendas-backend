import { Controller, Get, Post, Patch, Delete, UseGuards, Body, Param, Query, Req, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrcamentosService } from './orcamentos.service';
import { PdfService } from '../common/services/pdf.service';
import { Response } from 'express';

@Controller('orcamentos')
@UseGuards(JwtAuthGuard)
export class OrcamentosController {
  constructor(
    private readonly orcamentosService: OrcamentosService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  async listarOrcamentos(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.orcamentosService.listarOrcamentos(req.empresaId, { status, search });
  }

  @Get('stats')
  async obterEstatisticas(@Req() req: any) {
    return this.orcamentosService.obterEstatisticas(req.empresaId);
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: number, @Req() req: any) {
    return this.orcamentosService.buscarPorId(id, req.empresaId);
  }

  @Get(':id/pdf')
  async gerarPdf(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
    const orcamento = await this.orcamentosService.buscarPorIdParaPdf(id, req.empresaId);
    const pdfBuffer = this.pdfService.gerarPdfOrcamento(orcamento as any);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="orcamento-${orcamento.numero}.pdf"`);
    res.send(pdfBuffer);
  }

  @Post()
  async criar(@Body() data: any, @Req() req: any) {
    return this.orcamentosService.criar(req.empresaId, data);
  }

  @Patch(':id')
  async atualizar(@Param('id') id: number, @Body() data: any, @Req() req: any) {
    return this.orcamentosService.atualizar(id, req.empresaId, data);
  }

  @Delete(':id')
  async excluir(@Param('id') id: number, @Req() req: any) {
    return this.orcamentosService.excluir(id, req.empresaId);
  }

  @Post(':id/converter')
  async converterEmPedido(@Param('id') id: number, @Req() req: any) {
    return this.orcamentosService.converterEmPedido(id, req.empresaId);
  }
}
