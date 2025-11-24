import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Pedido } from '../../pedidos/pedido.entity';
import { Orcamento } from '../../orcamentos/orcamento.entity';

@Injectable()
export class PdfService {
  gerarPdfPedido(pedido: Pedido & { cliente?: any; vendedor?: any; itens?: any[] }): Buffer {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Cabeçalho
    doc
      .fontSize(20)
      .text('PEDIDO DE VENDA', { align: 'center' })
      .moveDown();

    // Informações do pedido
    doc
      .fontSize(12)
      .text(`Número: ${pedido.numero}`, { continued: true })
      .text(`Data: ${new Date(pedido.dataPedido).toLocaleDateString('pt-BR')}`, { align: 'right' })
      .moveDown();

    // Cliente
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

    // Vendedor
    if (pedido.vendedor) {
      doc
        .fontSize(14)
        .text('VENDEDOR', { underline: true })
        .fontSize(11)
        .text(`Nome: ${pedido.vendedor.nome || 'N/A'}`)
        .moveDown();
    }

    // Itens
    if (pedido.itens && pedido.itens.length > 0) {
      doc
        .fontSize(14)
        .text('ITENS DO PEDIDO', { underline: true })
        .moveDown(0.5);

      // Cabeçalho da tabela
      doc
        .fontSize(10)
        .text('Produto', 50, doc.y, { width: 200 })
        .text('Qtd', 250, doc.y, { width: 60, align: 'right' })
        .text('Preço Unit.', 310, doc.y, { width: 80, align: 'right' })
        .text('Subtotal', 390, doc.y, { width: 80, align: 'right' })
        .moveDown(0.3);

      // Linha separadora
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);

      // Itens
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

    // Totais
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

    // Observações
    if (pedido.observacoes) {
      doc
        .fontSize(11)
        .text('OBSERVAÇÕES:', { underline: true })
        .fontSize(10)
        .text(pedido.observacoes)
        .moveDown();
    }

    // Rodapé
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

    // Cabeçalho
    doc
      .fontSize(20)
      .text('ORÇAMENTO', { align: 'center' })
      .moveDown();

    // Informações do orçamento
    doc
      .fontSize(12)
      .text(`Número: ${orcamento.numero}`, { continued: true })
      .text(`Data: ${new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}`, { align: 'right' })
      .moveDown();

    // Status
    doc
      .fontSize(11)
      .text(`Status: ${orcamento.status.toUpperCase()}`, { align: 'right' })
      .moveDown();

    // Cliente
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

    // Vendedor
    if (orcamento.vendedor) {
      doc
        .fontSize(14)
        .text('VENDEDOR', { underline: true })
        .fontSize(11)
        .text(`Nome: ${orcamento.vendedor.nome || 'N/A'}`)
        .moveDown();
    }

    // Validade
    if (orcamento.dataValidade) {
      const dataValidade = orcamento.dataValidade;
      doc
        .fontSize(11)
        .text(`Validade: ${new Date(dataValidade).toLocaleDateString('pt-BR')}`)
        .moveDown();
    }

    // Itens
    if (orcamento.itens && orcamento.itens.length > 0) {
      doc
        .fontSize(14)
        .text('ITENS DO ORÇAMENTO', { underline: true })
        .moveDown(0.5);

      // Cabeçalho da tabela
      doc
        .fontSize(10)
        .text('Produto', 50, doc.y, { width: 200 })
        .text('Qtd', 250, doc.y, { width: 60, align: 'right' })
        .text('Preço Unit.', 310, doc.y, { width: 80, align: 'right' })
        .text('Subtotal', 390, doc.y, { width: 80, align: 'right' })
        .moveDown(0.3);

      // Linha separadora
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);

      // Itens
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

    // Total
    const total = Number(orcamento.valorTotal || 0);

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('TOTAL:', 350, doc.y, { width: 100, align: 'right' })
      .text(`R$ ${total.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' })
      .font('Helvetica')
      .moveDown();

    // Observações
    if (orcamento.observacoes) {
      doc
        .fontSize(11)
        .text('OBSERVAÇÕES:', { underline: true })
        .fontSize(10)
        .text(orcamento.observacoes)
        .moveDown();
    }

    // Rodapé
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

  gerarPdfTabela(
    titulo: string,
    colunas: string[],
    dados: any[][],
    opcoes?: { subtitulo?: string; rodape?: string },
  ): Buffer {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Cabeçalho
    doc
      .fontSize(20)
      .text(titulo, { align: 'center' })
      .moveDown(0.5);

    if (opcoes?.subtitulo) {
      doc
        .fontSize(12)
        .text(opcoes.subtitulo, { align: 'center' })
        .moveDown();
    }

    doc
      .fontSize(10)
      .text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' })
      .moveDown();

    // Calcular larguras das colunas
    const pageWidth = doc.page.width - 100; // Margens
    const numColunas = colunas.length;
    const larguraColuna = pageWidth / numColunas;

    // Cabeçalho da tabela
    let yPos = doc.y;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000');

    colunas.forEach((coluna, index) => {
      doc.text(coluna, 50 + index * larguraColuna, yPos, {
        width: larguraColuna - 10,
        align: index === 0 ? 'left' : 'left',
      });
    });

    // Linha separadora
    yPos += 20;
    doc
      .moveTo(50, yPos)
      .lineTo(pageWidth + 50, yPos)
      .stroke()
      .moveDown(0.3);

    // Dados
    doc.font('Helvetica').fontSize(9).fillColor('#000000');
    dados.forEach((linha, linhaIndex) => {
      const currentY = doc.y;
      
      // Verificar se precisa de nova página
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        yPos = 50;
      } else {
        yPos = currentY;
      }

      linha.forEach((celula, colIndex) => {
        const texto = celula?.toString() || '';
        doc.text(texto, 50 + colIndex * larguraColuna, yPos, {
          width: larguraColuna - 10,
          align: colIndex === 0 ? 'left' : 'left',
        });
      });

      doc.moveDown(0.4);
    });

    // Rodapé
    if (opcoes?.rodape) {
      const pageHeight = doc.page.height;
      doc
        .fontSize(8)
        .text(opcoes.rodape, 50, pageHeight - 50, { align: 'center', width: pageWidth });
    } else {
      const pageHeight = doc.page.height;
      doc
        .fontSize(8)
        .text(
          `Total de registros: ${dados.length} - Sistema AXORA`,
          50,
          pageHeight - 50,
          { align: 'center', width: pageWidth },
        );
    }

    doc.end();

    return Buffer.concat(buffers);
  }
}

