import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PedidosService } from './pedidos.service';
import { Response } from 'express';
import { PdfService } from '../common/services/pdf.service';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  async listar(@Req() req: any, @Query('status') status?: string) {
    return this.pedidosService.listarPedidos(req.empresaId, status);
  }

  @Get('stats')
  async estatisticas(@Req() req: any) {
    return this.pedidosService.obterEstatisticas(req.empresaId);
  }

  @Get('pipeline/snapshot')
  async pipelineSnapshot(@Req() req: any) {
    return this.pedidosService.obterPipelineSnapshot(req.empresaId);
  }

  @Get('aguardando-liberacao')
  async aguardandoLiberacao(@Req() req: any) {
    return this.pedidosService.listarAguardandoLiberacao(req.empresaId);
  }

  @Get(':id')
  async obter(@Param('id') id: string, @Req() req: any) {
    return this.pedidosService.obterPedido(+id, req.empresaId);
  }

  @Get(':id/pdf')
  async gerarPdf(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    const pedido = await this.pedidosService.obterPedido(+id, req.empresaId);
    const pdfBuffer = this.pdfService.gerarPdfPedido(pedido as any);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="pedido-${pedido.numero}.pdf"`);
    res.send(pdfBuffer);
  }

  @Post()
  async criar(@Body() data: any, @Req() req: any) {
    return this.pedidosService.criar(data, req.empresaId);
  }

  @Put(':id')
  async atualizar(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.pedidosService.atualizar(+id, req.empresaId, data);
  }

  @Patch(':id/status')
  async atualizarStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
    return this.pedidosService.atualizar(+id, req.empresaId, { status: body.status });
  }

  @Patch(':id/liberar')
  async liberarCredito(
    @Param('id') id: string,
    @Body() body: { aprovado: boolean; motivo?: string },
    @Req() req: any,
  ) {
    return this.pedidosService.liberarCredito(
      +id,
      req.empresaId,
      body.aprovado ?? false,
      req.user?.id ?? 0,
      body.motivo,
    );
  }

  @Delete(':id')
  async excluir(@Param('id') id: string, @Req() req: any) {
    return this.pedidosService.excluir(+id, req.empresaId);
  }
}
