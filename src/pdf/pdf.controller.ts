import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PdfService } from '../common/services/pdf.service';
import { Response } from 'express';

interface PdfTabelaDto {
  titulo: string;
  colunas: string[];
  dados: any[][];
  subtitulo?: string;
  rodape?: string;
}

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('gerar-tabela')
  async gerarTabela(@Body() dto: PdfTabelaDto, @Res() res: Response) {
    const pdfBuffer = this.pdfService.gerarPdfTabela(
      dto.titulo,
      dto.colunas,
      dto.dados,
      { subtitulo: dto.subtitulo, rodape: dto.rodape },
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  }
}

