import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaFiscalEntity } from './nota-fiscal.entity';
import { ItemNotaFiscalEntity } from './item-nota-fiscal.entity';
import { SpedEntity } from './sped.entity';
import { ImpostoEntity } from './imposto.entity';
import { EstoqueService } from '../estoque/estoque.service';

@Injectable()
export class FiscalService {
  constructor(
    @InjectRepository(NotaFiscalEntity)
    private readonly notaFiscalRepo: Repository<NotaFiscalEntity>,
    @InjectRepository(ItemNotaFiscalEntity)
    private readonly itemNotaFiscalRepo: Repository<ItemNotaFiscalEntity>,
    @InjectRepository(SpedEntity)
    private readonly spedRepo: Repository<SpedEntity>,
    @InjectRepository(ImpostoEntity)
    private readonly impostoRepo: Repository<ImpostoEntity>,
    @Inject(forwardRef(() => EstoqueService))
    private readonly estoqueService: EstoqueService,
  ) {}

  async listarNotasFiscais(empresaId: string, filtros?: { tipo?: string; status?: string }) {
    const query = this.notaFiscalRepo
      .createQueryBuilder('nf')
      .leftJoinAndSelect('nf.itens', 'itens')
      .leftJoinAndSelect('itens.produto', 'produto')
      .where('nf.empresaId = :empresaId', { empresaId });

    if (filtros?.tipo) {
      query.andWhere('nf.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros?.status) {
      query.andWhere('nf.status = :status', { status: filtros.status });
    }

    return query.orderBy('nf.criadoEm', 'DESC').getMany();
  }

  async obterNotaFiscalPorId(id: number, empresaId: string) {
    const nota = await this.notaFiscalRepo.findOne({ where: { id, empresaId }, relations: ['itens', 'itens.produto'] });
    if (!nota) {
      throw new NotFoundException('Nota fiscal não encontrada');
    }
    return nota;
  }

  async criarNotaFiscal(empresaId: string, data: Omit<Partial<NotaFiscalEntity>, 'itens'> & { itens?: Array<{ produtoId: number; quantidade: number; valorUnitario: number; valorTotal: number; descricao?: string }>; pedidoId?: number }) {
    const { itens, pedidoId, ...notaData } = data;
    const nota = this.notaFiscalRepo.create({ ...notaData, empresaId, pedidoId });
    const notaSalva = await this.notaFiscalRepo.save(nota);

    if (itens && itens.length > 0) {
      const itensEntities = itens.map((item) =>
        this.itemNotaFiscalRepo.create({
          empresaId,
          notaFiscalId: notaSalva.id,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal,
          descricao: item.descricao,
        }),
      );
      await this.itemNotaFiscalRepo.save(itensEntities);
    }

    if (notaSalva.status === 'autorizada' && (notaSalva.tipo === 'entrada' || notaSalva.tipo === 'saida')) {
      await this.criarMovimentacoesAutomaticas(notaSalva.id, empresaId);
    }

    return this.obterNotaFiscalPorId(notaSalva.id, empresaId);
  }

  async atualizarNotaFiscal(id: number, empresaId: string, data: Omit<Partial<NotaFiscalEntity>, 'itens'> & { itens?: Array<{ produtoId: number; quantidade: number; valorUnitario: number; valorTotal: number; descricao?: string }> }) {
    const nota = await this.notaFiscalRepo.findOne({ where: { id, empresaId }, relations: ['itens'] });
    if (!nota) {
      throw new NotFoundException('Nota fiscal não encontrada');
    }

    const statusAnterior = nota.status;
    const { itens, ...notaData } = data;
    Object.assign(nota, notaData);
    const notaAtualizada = await this.notaFiscalRepo.save(nota);

    if (itens !== undefined) {
      await this.itemNotaFiscalRepo.delete({ notaFiscalId: id });
      if (itens.length > 0) {
        const itensEntities = itens.map((item) =>
          this.itemNotaFiscalRepo.create({
            empresaId,
            notaFiscalId: id,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.valorTotal,
            descricao: item.descricao,
          }),
        );
        await this.itemNotaFiscalRepo.save(itensEntities);
      }
    }

    if (statusAnterior !== 'autorizada' && notaAtualizada.status === 'autorizada' && (notaAtualizada.tipo === 'entrada' || notaAtualizada.tipo === 'saida')) {
      await this.criarMovimentacoesAutomaticas(id, empresaId);
    }

    return this.obterNotaFiscalPorId(id, empresaId);
  }

  async cancelarNotaFiscal(id: number, empresaId: string) {
    const nota = await this.notaFiscalRepo.findOne({ where: { id, empresaId }, relations: ['itens'] });
    if (!nota) {
      throw new NotFoundException('Nota fiscal não encontrada');
    }
    if (nota.status === 'cancelada') {
      throw new Error('Nota fiscal já está cancelada');
    }

    if (nota.status === 'autorizada' && (nota.tipo === 'entrada' || nota.tipo === 'saida') && nota.itens && nota.itens.length > 0) {
      await this.reverterMovimentacoesAutomaticas(id, empresaId, nota.tipo);
    }

    nota.status = 'cancelada';
    return this.notaFiscalRepo.save(nota);
  }

  async obterStatsNotasFiscais(empresaId: string) {
    const total = await this.notaFiscalRepo.count({ where: { empresaId } });
    const autorizadas = await this.notaFiscalRepo.count({ where: { empresaId, status: 'autorizada' } });
    const canceladas = await this.notaFiscalRepo.count({ where: { empresaId, status: 'cancelada' } });
    const valorTotal = await this.notaFiscalRepo
      .createQueryBuilder('nf')
      .select('SUM(nf.valorTotal)', 'total')
      .where('nf.empresaId = :empresaId', { empresaId })
      .andWhere("nf.status = 'autorizada'")
      .getRawOne();

    return {
      total,
      autorizadas,
      canceladas,
      valorTotal: parseFloat(valorTotal?.total || '0'),
    };
  }

  async listarSped(empresaId: string, filtros?: { tipo?: string; competencia?: string }) {
    const query = this.spedRepo.createQueryBuilder('sped').where('sped.empresaId = :empresaId', { empresaId });

    if (filtros?.tipo) {
      query.andWhere('sped.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros?.competencia) {
      query.andWhere('sped.competencia = :competencia', { competencia: filtros.competencia });
    }

    return query.orderBy('sped.criadoEm', 'DESC').getMany();
  }

  async criarSped(empresaId: string, data: Partial<SpedEntity>) {
    const sped = this.spedRepo.create({ ...data, empresaId });
    return this.spedRepo.save(sped);
  }

  async listarImpostos(empresaId: string, filtros?: { tipo?: string }) {
    const query = this.impostoRepo.createQueryBuilder('imposto').where('imposto.empresaId = :empresaId', { empresaId });

    if (filtros?.tipo) {
      query.andWhere('imposto.tipo = :tipo', { tipo: filtros.tipo });
    }

    return query.orderBy('imposto.descricao', 'ASC').getMany();
  }

  async criarImposto(empresaId: string, data: Partial<ImpostoEntity>) {
    const imposto = this.impostoRepo.create({ ...data, empresaId });
    return this.impostoRepo.save(imposto);
  }

  async atualizarImposto(id: number, empresaId: string, data: Partial<ImpostoEntity>) {
    const imposto = await this.impostoRepo.findOne({ where: { id, empresaId } });
    if (!imposto) {
      throw new NotFoundException('Imposto não encontrado');
    }
    Object.assign(imposto, data);
    return this.impostoRepo.save(imposto);
  }

  private async criarMovimentacoesAutomaticas(notaFiscalId: number, empresaId: string) {
    try {
      const movimentacoesExistentes = await this.estoqueService.listarMovimentacoesPorNotaFiscal(notaFiscalId, empresaId);
      if (movimentacoesExistentes && movimentacoesExistentes.length > 0) {
        return;
      }

      const nota = await this.notaFiscalRepo.findOne({
        where: { id: notaFiscalId, empresaId },
        relations: ['itens', 'itens.produto'],
      });

      if (!nota || !nota.itens || nota.itens.length === 0) {
        return;
      }

      const tipoMovimentacao = nota.tipo === 'entrada' ? 'entrada' : 'saida';

      for (const item of nota.itens) {
        const referencia = `NF ${nota.numero}/${nota.serie}${nota.chaveAcesso ? ` - Chave: ${nota.chaveAcesso.substring(0, 8)}...` : ''}`;
        const observacao = `Movimentação automática gerada pela Nota Fiscal ${nota.numero}/${nota.serie}`;

        await this.estoqueService.registrarMovimentacao(
          {
            produtoId: item.produtoId,
            tipo: tipoMovimentacao,
            quantidade: item.quantidade,
            custoUnitario: Number(item.valorUnitario),
            referencia,
            observacao,
          },
          empresaId,
          notaFiscalId,
        );
      }
    } catch (error) {
      console.error(`[FiscalService] ❌ Erro ao criar movimentações automáticas para NF ${notaFiscalId}:`, error);
    }
  }

  private async reverterMovimentacoesAutomaticas(notaFiscalId: number, empresaId: string, tipoNota: string) {
    try {
      const nota = await this.notaFiscalRepo.findOne({ where: { id: notaFiscalId, empresaId } });
      if (!nota) {
        return;
      }

      const movimentacoes = await this.estoqueService.listarMovimentacoesPorNotaFiscal(notaFiscalId, empresaId);

      if (!movimentacoes || movimentacoes.length === 0) {
        return;
      }

      const tipoReversao = tipoNota === 'entrada' ? 'saida' : 'entrada';

      for (const mov of movimentacoes) {
        await this.estoqueService.registrarMovimentacao(
          {
            produtoId: mov.produtoId,
            tipo: tipoReversao,
            quantidade: mov.quantidade,
            custoUnitario: mov.custoUnitario ? Number(mov.custoUnitario) : undefined,
            referencia: `Reversão - NF ${nota.numero}/${nota.serie} cancelada`,
            observacao: `Reversão automática devido ao cancelamento da Nota Fiscal ${nota.numero}/${nota.serie}`,
            depositoOrigemId: mov.depositoOrigemId ?? undefined,
            depositoDestinoId: mov.depositoDestinoId ?? undefined,
          },
          empresaId,
        );
      }
    } catch (error) {
      console.error(`[FiscalService] ❌ Erro ao reverter movimentações automáticas para NF ${notaFiscalId}:`, error);
    }
  }

  async gerarPDF(notaFiscalId: number, empresaId: string): Promise<Buffer> {
    const PDFDocument = require('pdfkit');
    const nota = await this.obterNotaFiscalPorId(notaFiscalId, empresaId);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(20).text(`NOTA FISCAL ELETRÔNICA`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Número: ${nota.numero}`);
        doc.text(`Série: ${nota.serie}`);
        doc.text(`Tipo: ${nota.tipo.toUpperCase()}`);
        doc.text(`Status: ${nota.status.toUpperCase()}`);
        doc.moveDown();

        if (nota.chaveAcesso) {
          doc.text(`Chave de Acesso: ${nota.chaveAcesso}`);
          doc.moveDown();
        }

        if (nota.dataEmissao) {
          doc.text(`Data de Emissão: ${new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}`);
        }
        if (nota.dataAutorizacao) {
          doc.text(`Data de Autorização: ${new Date(nota.dataAutorizacao).toLocaleDateString('pt-BR')}`);
        }
        doc.moveDown();

        doc.fontSize(16).text('ITENS', { underline: true });
        doc.moveDown();

        if (nota.itens && nota.itens.length > 0) {
          doc.fontSize(10);
          nota.itens.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.descricao || `Produto ID: ${item.produtoId}`}`);
            doc.text(`   Quantidade: ${item.quantidade} | Valor Unitário: R$ ${item.valorUnitario.toFixed(2)} | Total: R$ ${item.valorTotal.toFixed(2)}`);
            doc.moveDown(0.5);
          });
        }

        doc.moveDown();
        doc.fontSize(14).text(`VALOR TOTAL: R$ ${nota.valorTotal.toFixed(2)}`, { align: 'right' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async gerarXML(notaFiscalId: number, empresaId: string): Promise<string> {
    const nota = await this.obterNotaFiscalPorId(notaFiscalId, empresaId);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">\n';
    xml += '  <NFe>\n';
    xml += `    <infNFe Id="NFe${nota.chaveAcesso || `${nota.numero}${nota.serie}`}">\n`;
    xml += `      <ide>\n`;
    xml += `        <nNF>${nota.numero}</nNF>\n`;
    xml += `        <serie>${nota.serie}</serie>\n`;
    xml += `        <natOp>${nota.tipo === 'entrada' ? 'ENTRADA' : 'SAIDA'}</natOp>\n`;
    if (nota.dataEmissao) {
      xml += `        <dhEmi>${new Date(nota.dataEmissao).toISOString()}</dhEmi>\n`;
    }
    xml += `      </ide>\n`;

    if (nota.itens && nota.itens.length > 0) {
      xml += `      <det>\n`;
      nota.itens.forEach((item, index) => {
        xml += `        <prod>\n`;
        xml += `          <cProd>${item.produtoId}</cProd>\n`;
        xml += `          <xProd>${item.descricao || `Produto ${item.produtoId}`}</xProd>\n`;
        xml += `          <qCom>${item.quantidade}</qCom>\n`;
        xml += `          <vUnCom>${item.valorUnitario.toFixed(2)}</vUnCom>\n`;
        xml += `          <vProd>${item.valorTotal.toFixed(2)}</vProd>\n`;
        xml += `        </prod>\n`;
      });
      xml += `      </det>\n`;
    }

    xml += `      <total>\n`;
    xml += `        <ICMSTot>\n`;
    xml += `          <vNF>${nota.valorTotal.toFixed(2)}</vNF>\n`;
    xml += `        </ICMSTot>\n`;
    xml += `      </total>\n`;
    xml += `    </infNFe>\n`;
    xml += `  </NFe>\n`;
    xml += `</nfeProc>\n`;

    return xml;
  }
}

