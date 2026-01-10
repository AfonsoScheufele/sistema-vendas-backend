import { Injectable } from '@nestjs/common';
import { Pedido } from '../../pedidos/pedido.entity';
import { Orcamento } from '../../orcamentos/orcamento.entity';
import * as sharp from 'sharp';

const PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  gerarPdfPedido(pedido: Pedido & { cliente?: any; vendedor?: any; itens?: any[] }): Buffer {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc
      .fontSize(20)
      .text('PEDIDO DE VENDA', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text(`Número: ${pedido.numero}`, { continued: true })
      .text(`Data: ${new Date(pedido.dataPedido).toLocaleDateString('pt-BR')}`, { align: 'right' })
      .moveDown();

    if (pedido.cliente) {
      doc
        .fontSize(14)
        .text('CLIENTE', { underline: true })
        .fontSize(11)
        .text(`Nome: ${pedido.cliente.nome || 'N/A'}`)
        .text(`Email: ${pedido.cliente.email || 'N/A'}`)
        .text(`Telefone: ${pedido.cliente.telefone || 'N/A'}`)
        .moveDown();
    }

    if (pedido.vendedor) {
      doc
        .fontSize(14)
        .text('VENDEDOR', { underline: true })
        .fontSize(11)
        .text(`Nome: ${pedido.vendedor.nome || 'N/A'}`)
        .moveDown();
    }

    if (pedido.itens && pedido.itens.length > 0) {
      doc
        .fontSize(14)
        .text('ITENS DO PEDIDO', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .text('Produto', 50, doc.y, { width: 200 })
        .text('Qtd', 250, doc.y, { width: 60, align: 'right' })
        .text('Preço Unit.', 310, doc.y, { width: 80, align: 'right' })
        .text('Subtotal', 390, doc.y, { width: 80, align: 'right' })
        .moveDown(0.3);

      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);

      pedido.itens.forEach((item) => {
        const produtoNome = item.produto?.nome || 'Produto não encontrado';
        const quantidade = item.quantidade || 0;
        const precoUnitario = Number(item.precoUnitario || 0);
        const subtotal = Number(item.subtotal || 0);

        doc
          .fontSize(9)
          .text(produtoNome, 50, doc.y, { width: 200 })
          .text(quantidade.toString(), 250, doc.y, { width: 60, align: 'right' })
          .text(`R$ ${precoUnitario.toFixed(2)}`, 310, doc.y, { width: 80, align: 'right' })
          .text(`R$ ${subtotal.toFixed(2)}`, 390, doc.y, { width: 80, align: 'right' })
          .moveDown(0.4);
      });

      doc.moveDown(0.5);
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);
    }

    const desconto = Number(pedido.desconto || 0);
    const total = Number(pedido.total || 0);
    const subtotal = total + desconto;

    doc
      .fontSize(11)
      .text('Subtotal:', 350, doc.y, { width: 100, align: 'right' })
      .text(`R$ ${subtotal.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' })
      .moveDown(0.3);

    if (desconto > 0) {
      doc
        .text('Desconto:', 350, doc.y, { width: 100, align: 'right' })
        .text(`- R$ ${desconto.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' })
        .moveDown(0.3);
    }

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('TOTAL:', 350, doc.y, { width: 100, align: 'right' })
      .text(`R$ ${total.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' })
      .font('Helvetica')
      .moveDown();

    if (pedido.observacoes) {
      doc
        .fontSize(11)
        .text('OBSERVAÇÕES:', { underline: true })
        .fontSize(10)
        .text(pedido.observacoes)
        .moveDown();
    }

    const pageHeight = doc.page.height;
    doc
      .fontSize(8)
      .text(
        `Gerado em ${new Date().toLocaleString('pt-BR')} - Sistema AXORA`,
        50,
        pageHeight - 50,
        { align: 'center', width: 500 },
      );

    doc.end();

    return Buffer.concat(buffers);
  }

  gerarPdfOrcamento(orcamento: Orcamento & { cliente?: any; vendedor?: any; itens?: any[] }): Buffer {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc
      .fontSize(20)
      .text('ORÇAMENTO', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text(`Número: ${orcamento.numero}`, { continued: true })
      .text(`Data: ${new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}`, { align: 'right' })
      .moveDown();

    doc
      .fontSize(11)
      .text(`Status: ${orcamento.status.toUpperCase()}`, { align: 'right' })
      .moveDown();

    if (orcamento.cliente) {
      doc
        .fontSize(14)
        .text('CLIENTE', { underline: true })
        .fontSize(11)
        .text(`Nome: ${orcamento.cliente.nome || 'N/A'}`)
        .text(`Email: ${orcamento.cliente.email || 'N/A'}`)
        .text(`Telefone: ${orcamento.cliente.telefone || 'N/A'}`)
        .moveDown();
    }

    if (orcamento.vendedor) {
      doc
        .fontSize(14)
        .text('VENDEDOR', { underline: true })
        .fontSize(11)
        .text(`Nome: ${orcamento.vendedor.nome || 'N/A'}`)
        .moveDown();
    }

    if (orcamento.dataValidade) {
      const dataValidade = orcamento.dataValidade;
      doc
        .fontSize(11)
        .text(`Validade: ${new Date(dataValidade).toLocaleDateString('pt-BR')}`)
        .moveDown();
    }

    if (orcamento.itens && orcamento.itens.length > 0) {
      doc
        .fontSize(14)
        .text('ITENS DO ORÇAMENTO', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .text('Produto', 50, doc.y, { width: 200 })
        .text('Qtd', 250, doc.y, { width: 60, align: 'right' })
        .text('Preço Unit.', 310, doc.y, { width: 80, align: 'right' })
        .text('Subtotal', 390, doc.y, { width: 80, align: 'right' })
        .moveDown(0.3);

      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);

      orcamento.itens.forEach((item: any) => {
        const produtoNome = item.produto?.nome || item.descricao || 'Produto não encontrado';
        const quantidade = item.quantidade || 0;
        const precoUnitario = Number(item.precoUnitario || 0);
        const subtotal = Number(item.subtotal || 0);

        doc
          .fontSize(9)
          .text(produtoNome, 50, doc.y, { width: 200 })
          .text(quantidade.toString(), 250, doc.y, { width: 60, align: 'right' })
          .text(`R$ ${precoUnitario.toFixed(2)}`, 310, doc.y, { width: 80, align: 'right' })
          .text(`R$ ${subtotal.toFixed(2)}`, 390, doc.y, { width: 80, align: 'right' })
          .moveDown(0.4);
      });

      doc.moveDown(0.5);
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);
    }

    const total = Number(orcamento.valorTotal || 0);

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('TOTAL:', 350, doc.y, { width: 100, align: 'right' })
      .text(`R$ ${total.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' })
      .font('Helvetica')
      .moveDown();

    if (orcamento.observacoes) {
      doc
        .fontSize(11)
        .text('OBSERVAÇÕES:', { underline: true })
        .fontSize(10)
        .text(orcamento.observacoes)
        .moveDown();
    }

    const pageHeight = doc.page.height;
    doc
      .fontSize(8)
      .text(
        `Gerado em ${new Date().toLocaleString('pt-BR')} - Sistema AXORA`,
        50,
        pageHeight - 50,
        { align: 'center', width: 500 },
      );

    doc.end();

    return Buffer.concat(buffers);
  }

  async gerarPdfTabela(
    titulo: string,
    colunas: string[],
    dados: any[][],
    opcoes?: { 
      subtitulo?: string; 
      rodape?: string;
      config?: {
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
      };
    },
  ): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const buffers: Buffer[] = [];
    let resolveEnd: () => void;
    const endPromise = new Promise<void>((resolve) => {
      resolveEnd = resolve;
    });

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolveEnd();
    });

    const config = opcoes?.config || {};
    const hexToRgb = (hex: string): [number, number, number] => {
      if (!hex || hex === '#000000' || hex === '#000') {
        return [0, 0, 0];
      }
      const cleanHex = hex.replace('#', '');
      if (cleanHex.length !== 6) {
        return [79, 70, 229];
      }
      const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
      return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [79, 70, 229];
    };

    const corPrimaria = hexToRgb(config.corPrimaria || '#4f46e5');
    const corTexto = hexToRgb(config.corTexto || '#1e293b');
    const corTextoClaro = hexToRgb(config.corTextoClaro || '#64748b');
    const nomeEmpresa = config.nomeEmpresa || 'AXORA';
    const subtituloConfig = config.subtitulo || 'Sistema de Gestão de Vendas';
    const estiloTabela = config.estiloTabela || 'plain';
    const mostrarLogo = config.mostrarLogo === true;
    const mostrarData = config.mostrarData !== false;

    const headerHeight = 80;
    doc
      .rect(0, 0, doc.page.width, headerHeight)
      .fillColor(`rgb(${corPrimaria[0]}, ${corPrimaria[1]}, ${corPrimaria[2]})`)
      .fill();

    let logoX = 50;
    let processedLogoBuffer: Buffer | null = null;
    let logoWidth = 0;
    let logoHeight = 0;
    
    if (mostrarLogo && config.logoUrl) {
      try {
        let logoBuffer: Buffer | undefined;
        
        if (config.logoUrl.startsWith('data:image')) {
          const base64Data = config.logoUrl.split(',')[1];
          if (base64Data) {
            logoBuffer = Buffer.from(base64Data, 'base64');
          }
        } else {
          const https = require('https');
          const http = require('http');
          const url = require('url');
          const parsedUrl = url.parse(config.logoUrl);
          const client = parsedUrl.protocol === 'https:' ? https : http;
          
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => resolve(), 2000);
            client.get(config.logoUrl, (response: any) => {
              if (response.statusCode === 200) {
                const chunks: Buffer[] = [];
                response.on('data', (chunk: Buffer) => chunks.push(chunk));
                response.on('end', () => {
                  logoBuffer = Buffer.concat(chunks);
                  clearTimeout(timeout);
                  resolve();
                });
                response.on('error', () => {
                  clearTimeout(timeout);
                  resolve();
                });
              } else {
                clearTimeout(timeout);
                resolve();
              }
            }).on('error', () => {
              clearTimeout(timeout);
              resolve();
            });
          });
        }
        
        if (logoBuffer && logoBuffer.length > 0) {
          processedLogoBuffer = await this.processarLogo(logoBuffer);
          const imageMetadata = await sharp(processedLogoBuffer).metadata();
          const imageWidth = imageMetadata.width || 200;
          const imageHeight = imageMetadata.height || 76;
          const aspectRatio = imageWidth / imageHeight;
          
          const padding = 2;
          const tamanhoLogo = (config?.tamanhoLogo || 'medio') as 'pequeno' | 'medio' | 'grande';
          
          if (tamanhoLogo === 'pequeno') {
            logoHeight = 30;
          } else if (tamanhoLogo === 'grande') {
            logoHeight = headerHeight - (padding * 2);
          } else {
            logoHeight = 50;
          }
          
          logoWidth = logoHeight * aspectRatio;
          const logoY = (headerHeight - logoHeight) / 2;
          
          doc.image(processedLogoBuffer, 50, logoY, { 
            width: logoWidth, 
            height: logoHeight
          });
          logoX = 50 + logoWidth + 25;
        }
      } catch (err) {
        logoX = 50;
      }
    }

    doc
      .fillColor(`rgb(255, 255, 255)`)
      .fontSize(26)
      .font('Helvetica-Bold')
      .text(nomeEmpresa, logoX, 30)
      .fontSize(13)
      .font('Helvetica')
      .text(subtituloConfig, logoX, 55);

    if (mostrarData) {
      doc
        .fillColor(`rgb(255, 255, 255)`)
        .fontSize(11)
        .font('Helvetica')
        .text(
          new Date().toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          doc.page.width - 50,
          35,
          { align: 'right', width: 200 }
        );
    }

    let startY = headerHeight + 30;
    
    doc
      .fillColor(`rgb(${corTexto[0]}, ${corTexto[1]}, ${corTexto[2]})`)
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(titulo, 50, startY, { align: 'center', width: doc.page.width - 100 });

    if (opcoes?.subtitulo) {
      startY += 15;
      doc
        .fillColor(`rgb(${corTextoClaro[0]}, ${corTextoClaro[1]}, ${corTextoClaro[2]})`)
        .fontSize(11)
        .font('Helvetica')
        .text(opcoes.subtitulo, 50, startY, { align: 'center', width: doc.page.width - 100 });
    }

    startY += 20;
    const pageWidth = doc.page.width;
    const marginLeft = 50;
    const marginRight = 50;
    const numColunas = colunas.length;
    const larguraColuna = (pageWidth - marginLeft - marginRight) / numColunas;

    let yPos = startY;
    const tableWidth = pageWidth - marginLeft - marginRight;
    const headerRowHeight = 12;
    
    doc
      .rect(marginLeft, yPos, tableWidth, headerRowHeight)
      .fillColor(`rgb(${corPrimaria[0]}, ${corPrimaria[1]}, ${corPrimaria[2]})`)
      .fill();

    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(`rgb(255, 255, 255)`);

    colunas.forEach((coluna, index) => {
      const xPos = marginLeft + index * larguraColuna + 5;
      doc.text(coluna, xPos, yPos + 8, {
        width: larguraColuna - 10,
        align: 'left',
      });
    });

    yPos += headerRowHeight + 5;
    const corBorda = [200, 200, 200];
    const corCinzaClaro = [245, 245, 245];
    
    for (let linhaIndex = 0; linhaIndex < dados.length; linhaIndex++) {
      const linha = dados[linhaIndex];
      
      if (yPos > doc.page.height - 60) {
        doc.addPage();
        
        doc
          .rect(0, 0, doc.page.width, headerHeight)
          .fillColor(`rgb(${corPrimaria[0]}, ${corPrimaria[1]}, ${corPrimaria[2]})`)
          .fill();
        
        if (processedLogoBuffer && logoWidth > 0 && logoHeight > 0) {
          try {
            const logoY = (headerHeight - logoHeight) / 2;
            doc.image(processedLogoBuffer, 50, logoY, { 
              width: logoWidth, 
              height: logoHeight
            });
          } catch (err) {
          }
        }
        
        doc
          .fillColor(`rgb(255, 255, 255)`)
          .fontSize(26)
          .font('Helvetica-Bold')
          .text(nomeEmpresa, logoX, 30)
          .fontSize(13)
          .font('Helvetica')
          .text(subtituloConfig, logoX, 55);
        
        if (mostrarData) {
          doc
            .fillColor(`rgb(255, 255, 255)`)
            .fontSize(11)
            .font('Helvetica')
            .text(
              new Date().toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              doc.page.width - 50,
              35,
              { align: 'right', width: 200 }
            );
        }
        
        yPos = headerHeight + 30;
        
        doc
          .rect(marginLeft, yPos, tableWidth, headerRowHeight)
          .fillColor(`rgb(${corPrimaria[0]}, ${corPrimaria[1]}, ${corPrimaria[2]})`)
          .fill();
        
        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .fillColor(`rgb(255, 255, 255)`);
        
        colunas.forEach((coluna, index) => {
          const xPos = marginLeft + index * larguraColuna + 5;
          doc.text(coluna, xPos, yPos + 8, {
            width: larguraColuna - 10,
            align: 'left',
          });
        });
        
        yPos += headerRowHeight + 5;
      }

      const rowHeight = 12;
      const isStriped = estiloTabela === 'striped' && linhaIndex % 2 === 1;
      
      if (estiloTabela === 'grid' || isStriped) {
        if (isStriped) {
          doc
            .rect(marginLeft, yPos, tableWidth, rowHeight)
            .fillColor(`rgb(${corCinzaClaro[0]}, ${corCinzaClaro[1]}, ${corCinzaClaro[2]})`)
            .fill();
        }
        
        if (estiloTabela === 'grid') {
          doc
            .strokeColor(`rgb(${corBorda[0]}, ${corBorda[1]}, ${corBorda[2]})`)
            .lineWidth(0.3)
            .rect(marginLeft, yPos, tableWidth, rowHeight)
            .stroke();
        } else if (isStriped) {
          doc
            .strokeColor(`rgb(${corBorda[0]}, ${corBorda[1]}, ${corBorda[2]})`)
            .lineWidth(0.2)
            .moveTo(marginLeft, yPos + rowHeight)
            .lineTo(marginLeft + tableWidth, yPos + rowHeight)
            .stroke();
        }
      }

      linha.forEach((celula, colIndex) => {
        const texto = celula?.toString() || '';
        const xPos = marginLeft + colIndex * larguraColuna + 5;
        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor(`rgb(${corTexto[0]}, ${corTexto[1]}, ${corTexto[2]})`)
          .text(texto, xPos, yPos + 9, {
            width: larguraColuna - 10,
            align: 'left',
          });
      });

      yPos += rowHeight + 2;
    }
    
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 25;
    const corBordaRodape = [220, 220, 220];
    
    if (yPos < footerY - 10) {
      doc
        .strokeColor(`rgb(${corBordaRodape[0]}, ${corBordaRodape[1]}, ${corBordaRodape[2]})`)
        .lineWidth(0.5)
        .moveTo(marginLeft, footerY - 3)
        .lineTo(pageWidth - marginRight, footerY - 3)
        .stroke();
      
      const rodapeTexto = opcoes?.rodape || config.rodape || `Total de registros: ${dados.length} - ${nomeEmpresa}`;
      doc
        .fillColor(`rgb(${corTextoClaro[0]}, ${corTextoClaro[1]}, ${corTextoClaro[2]})`)
        .fontSize(8)
        .font('Helvetica')
        .text(rodapeTexto, marginLeft, footerY + 3, { align: 'center', width: tableWidth });
    }

    doc.end();

    await endPromise;

    if (buffers.length === 0) {
      throw new Error('Erro ao gerar PDF: nenhum buffer foi criado');
    }

    return Buffer.concat(buffers);
  }

  private async processarLogo(logoBuffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(logoBuffer);
      const metadata = await image.metadata();
      
      let processed = image.ensureAlpha();
      
      if (metadata.format === 'png' && metadata.hasAlpha) {
        return await processed.png().toBuffer();
      }

      const { data, info } = await processed.toBuffer({ resolveWithObject: true });

      if (!info || !info.width || !info.height || !info.channels || !data) {
        return await image.png().toBuffer();
      }

      const pixels = new Uint8Array(data);
      const width = info.width;
      const height = info.height;
      const channels = info.channels || 4;
      
      if (width === 0 || height === 0 || channels < 3) {
        return await image.png().toBuffer();
      }
      
      const edgeThreshold = 8;
      const tolerance = 35;
      
      const cornerSamples: number[][] = [];
      const sampleSize = Math.min(edgeThreshold, Math.floor(width / 4), Math.floor(height / 4));
      
      for (let y = 0; y < sampleSize; y++) {
        for (let x = 0; x < sampleSize; x++) {
          const idx = (y * width + x) * channels;
          cornerSamples.push([pixels[idx], pixels[idx + 1], pixels[idx + 2]]);
          
          const idxRight = ((y) * width + (width - 1 - x)) * channels;
          cornerSamples.push([pixels[idxRight], pixels[idxRight + 1], pixels[idxRight + 2]]);
          
          const idxBottom = ((height - 1 - y) * width + x) * channels;
          cornerSamples.push([pixels[idxBottom], pixels[idxBottom + 1], pixels[idxBottom + 2]]);
          
          const idxBottomRight = ((height - 1 - y) * width + (width - 1 - x)) * channels;
          cornerSamples.push([pixels[idxBottomRight], pixels[idxBottomRight + 1], pixels[idxBottomRight + 2]]);
        }
      }
      
      if (cornerSamples.length === 0) {
        return await image.png().toBuffer();
      }
      
      const avgR = cornerSamples.reduce((sum, c) => sum + c[0], 0) / cornerSamples.length;
      const avgG = cornerSamples.reduce((sum, c) => sum + c[1], 0) / cornerSamples.length;
      const avgB = cornerSamples.reduce((sum, c) => sum + c[2], 0) / cornerSamples.length;
      
      const edgePixels: number[][] = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const isEdge = x < edgeThreshold || x >= width - edgeThreshold || 
                         y < edgeThreshold || y >= height - edgeThreshold;
          
          if (isEdge) {
            const idx = (y * width + x) * channels;
            edgePixels.push([pixels[idx], pixels[idx + 1], pixels[idx + 2]]);
          }
        }
      }
      
      const edgeAvgR = edgePixels.length > 0 ? edgePixels.reduce((sum, c) => sum + c[0], 0) / edgePixels.length : avgR;
      const edgeAvgG = edgePixels.length > 0 ? edgePixels.reduce((sum, c) => sum + c[1], 0) / edgePixels.length : avgG;
      const edgeAvgB = edgePixels.length > 0 ? edgePixels.reduce((sum, c) => sum + c[2], 0) / edgePixels.length : avgB;
      
      const bgR = Math.round((avgR + edgeAvgR) / 2);
      const bgG = Math.round((avgG + edgeAvgG) / 2);
      const bgB = Math.round((avgB + edgeAvgB) / 2);
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * channels;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          
          const distR = Math.abs(r - bgR);
          const distG = Math.abs(g - bgG);
          const distB = Math.abs(b - bgB);
          
          const maxDist = Math.max(distR, distG, distB);
          const avgDist = (distR + distG + distB) / 3;
          
          const isBackground = maxDist <= tolerance || avgDist <= tolerance * 0.75;
          
          if (isBackground) {
            pixels[idx + 3] = 0;
          } else {
            pixels[idx + 3] = 255;
          }
        }
      }

      return await sharp(Buffer.from(pixels), {
        raw: {
          width,
          height,
          channels: 4,
        },
      })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
    } catch (err) {
      return logoBuffer;
    }
  }
}

