import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PdfService } from '../common/services/pdf.service';
import { Response } from 'express';

interface PdfConfigDto {
  corPrimaria?: string;
  corSecundaria?: string;
  corTexto?: string;
  corTextoClaro?: string;
  nomeEmpresa?: string;
  subtitulo?: string;
  rodape?: string;
  logoUrl?: string;
  mostrarLogo?: boolean;
  mostrarData?: boolean;
  estiloTabela?: 'striped' | 'plain' | 'grid';
  tamanhoLogo?: 'pequeno' | 'medio' | 'grande';
}

interface PdfTabelaDto {
  titulo: string;
  colunas: string[];
  dados: any[][];
  subtitulo?: string;
  rodape?: string;
  config?: PdfConfigDto;
}

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('gerar-tabela')
  async gerarTabela(@Body() dto: PdfTabelaDto, @Res() res: Response) {
    try {
      const configCompleto = dto.config || {};
      const pdfBuffer = await this.pdfService.gerarPdfTabela(
        dto.titulo,
        dto.colunas,
        dto.dados,
        { 
          subtitulo: dto.subtitulo || configCompleto.subtitulo, 
          rodape: dto.rodape || configCompleto.rodape,
          config: configCompleto,
        },
      );

      if (!pdfBuffer || pdfBuffer.length === 0) {
        return res.status(500).json({ 
          message: 'Erro ao gerar PDF: buffer vazio',
          error: 'Empty buffer'
        });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ 
        message: 'Erro ao gerar PDF',
        error: error?.message || 'Unknown error',
        stack: error?.stack
      });
    }
  }
}

