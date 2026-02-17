import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Orcamento } from './orcamento.entity';
import { PedidosService } from '../pedidos/pedidos.service';
import { Produto } from '../produtos/produto.entity';

interface OrcamentoFiltros {
  status?: string;
  search?: string;
}

interface OrcamentoItem {
  produtoId: number;
  quantidade: number;
  valorUnitario?: number;
  precoUnitario?: number;
  subtotal?: number;
  comissao?: number;
}

@Injectable()
export class OrcamentosService {
  constructor(
    @InjectRepository(Orcamento)
    private readonly orcamentoRepo: Repository<Orcamento>,
    @InjectRepository(Produto)
    private readonly produtoRepo: Repository<Produto>,
    private readonly pedidosService: PedidosService,
  ) {}

  async listarOrcamentos(empresaId: string, filtros?: OrcamentoFiltros): Promise<Orcamento[]> {
    const query = this.orcamentoRepo
      .createQueryBuilder('orcamento')
      .leftJoinAndSelect('orcamento.cliente', 'cliente')
      .leftJoinAndSelect('orcamento.vendedor', 'vendedor')
      .where('orcamento.empresaId = :empresaId', { empresaId });

    if (filtros?.status && filtros.status !== 'todos') {
      query.andWhere('orcamento.status = :status', { status: filtros.status });
    }

    if (filtros?.search) {
      const termo = `%${filtros.search.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(orcamento.numero) LIKE :termo OR LOWER(orcamento.status) LIKE :termo OR LOWER(COALESCE(cliente.nome, \'\')) LIKE :termo)',
        { termo },
      );
    }

    return query.orderBy('orcamento.createdAt', 'DESC').getMany();
  }

  async buscarPorId(id: number, empresaId: string): Promise<Orcamento> {
    const orcamento = await this.orcamentoRepo.findOne({
      where: { id, empresaId },
      relations: ['cliente', 'vendedor'],
    });

    if (!orcamento) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    return orcamento;
  }

  async criar(empresaId: string, data: any): Promise<Orcamento> {
    const itens = Array.isArray(data.itens) ? data.itens : [];
    const { itens: _, ...restData } = data;

    let valorTotal = Number(restData.valorTotal || 0);
    if (itens.length > 0 && valorTotal === 0) {
      valorTotal = itens.reduce((acc: number, item: OrcamentoItem) => {
        const qty = Number(item.quantidade || 0);
        const preco = Number(item.valorUnitario ?? item.precoUnitario ?? 0);
        return acc + qty * preco;
      }, 0);
    }

    const ultimo = await this.orcamentoRepo.findOne({
      where: { empresaId },
      order: { id: 'DESC' },
    });
    let seq = 1;
    if (ultimo?.numero) {
      const match = ultimo.numero.replace(/\D/g, '');
      if (match) seq = parseInt(match, 10) + 1;
    }
    const numero = `ORC-${seq.toString().padStart(6, '0')}`;

    const itensNormalizados = itens.map((item: OrcamentoItem) => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: item.valorUnitario ?? item.precoUnitario ?? 0,
      subtotal: (item.quantidade || 0) * (item.valorUnitario ?? item.precoUnitario ?? 0),
      comissao: item.comissao ?? 0,
    }));

    const diasValidade = Number(restData.validade) || 30;
    const dataValidade = restData.dataValidade
      ? new Date(restData.dataValidade)
      : new Date(Date.now() + diasValidade * 24 * 60 * 60 * 1000);

    const orcamento = this.orcamentoRepo.create({
      numero,
      clienteId: restData.clienteId,
      vendedorId: restData.vendedorId,
      valorTotal,
      desconto: restData.desconto ?? null,
      status: restData.status ?? 'pendente',
      dataValidade,
      observacoes: restData.observacoes ?? null,
      empresaId,
      itens: itensNormalizados.length > 0 ? itensNormalizados : null,
    });
    return this.orcamentoRepo.save(orcamento);
  }

  async atualizar(id: number, empresaId: string, data: any): Promise<Orcamento> {
    await this.ensureOrcamento(id, empresaId);
    const itens = Array.isArray(data.itens) ? data.itens : undefined;
    const { itens: _, ...restData } = data;
    const updatePayload: any = { ...restData };
    if (itens !== undefined) {
      const itensNorm = itens.map((item: OrcamentoItem) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: item.valorUnitario ?? item.precoUnitario ?? 0,
        subtotal: (item.quantidade || 0) * (item.valorUnitario ?? item.precoUnitario ?? 0),
        comissao: item.comissao ?? 0,
      }));
      updatePayload.itens = itensNorm;
      if (itensNorm.length > 0) {
        const valorTotal = itensNorm.reduce((acc: number, i: any) => acc + (i.subtotal || 0), 0);
        updatePayload.valorTotal = valorTotal;
      }
    }
    await this.orcamentoRepo.update({ id, empresaId }, updatePayload);
    return this.buscarPorId(id, empresaId);
  }

  async excluir(id: number, empresaId: string): Promise<void> {
    await this.ensureOrcamento(id, empresaId);
    await this.orcamentoRepo.delete({ id, empresaId });
  }

  async converterEmPedido(id: number, empresaId: string): Promise<{ message: string; orcamentoId: number; pedidoId: number }> {
    const orcamento = await this.orcamentoRepo.findOne({
      where: { id, empresaId },
      relations: ['cliente', 'vendedor'],
    });
    if (!orcamento) {
      throw new NotFoundException('Orçamento não encontrado');
    }
    if (orcamento.status !== 'aceito') {
      throw new BadRequestException('Somente orçamentos aprovados podem ser convertidos em pedido.');
    }

    const itens = Array.isArray(orcamento.itens) ? orcamento.itens : [];
    if (itens.length === 0) {
      throw new BadRequestException('Orçamento não possui itens para conversão.');
    }

    const pedidoPayload = {
      clienteId: orcamento.clienteId,
      vendedorId: orcamento.vendedorId || undefined,
      valorTotal: Number(orcamento.valorTotal),
      desconto: Number(orcamento.desconto || 0),
      observacoes: orcamento.observacoes
        ? `Convertido do orçamento ${orcamento.numero}. ${orcamento.observacoes}`
        : `Convertido do orçamento ${orcamento.numero}`,
      itens: itens.map((item: OrcamentoItem) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario ?? item.valorUnitario ?? 0,
        comissao: item.comissao ?? 0,
      })),
    };

    const pedido = await this.pedidosService.criar(pedidoPayload, empresaId);
    return {
      message: 'Orçamento convertido em pedido com sucesso.',
      orcamentoId: orcamento.id,
      pedidoId: pedido.id,
    };
  }

  async obterEstatisticas(empresaId: string) {
    const [total, pendentes, aceitos, recusados, totalValorRaw] = await Promise.all([
      this.orcamentoRepo.count({ where: { empresaId } }),
      this.orcamentoRepo.count({ where: { empresaId, status: 'pendente' } }),
      this.orcamentoRepo.count({ where: { empresaId, status: 'aceito' } }),
      this.orcamentoRepo.count({ where: { empresaId, status: 'recusado' } }),
      this.orcamentoRepo
        .createQueryBuilder('orcamento')
        .select('COALESCE(SUM(orcamento.valorTotal), 0)', 'soma')
        .where('orcamento.empresaId = :empresaId', { empresaId })
        .getRawOne<{ soma: string }>(),
    ]);

    const valorTotal = Number(totalValorRaw?.soma ?? 0);
    const taxaConversao = total > 0 ? Number(((aceitos / total) * 100).toFixed(1)) : 0;

    return {
      totalOrcamentos: total,
      orcamentosPendentes: pendentes,
      orcamentosAprovados: aceitos,
      orcamentosRecusados: recusados,
      valorTotal,
      taxaConversao,
    };
  }

  async buscarPorIdParaPdf(id: number, empresaId: string): Promise<Orcamento & { itens?: any[] }> {
    const orcamento = await this.buscarPorId(id, empresaId);
    const itens = Array.isArray(orcamento.itens) ? orcamento.itens : [];
    if (itens.length === 0) return orcamento;
    const produtoIds = [...new Set(itens.map((i: any) => i.produtoId))];
    const produtos = await this.produtoRepo.find({ where: { id: In(produtoIds) } });
    const produtoMap = new Map(produtos.map((p) => [p.id, p]));
    const itensEnriquecidos = itens.map((item: any) => ({
      ...item,
      produto: produtoMap.get(item.produtoId) ? { nome: produtoMap.get(item.produtoId)!.nome } : null,
      descricao: produtoMap.get(item.produtoId)?.nome ?? 'Produto',
      precoUnitario: item.precoUnitario ?? item.valorUnitario ?? 0,
      subtotal: (item.quantidade || 0) * (item.precoUnitario ?? item.valorUnitario ?? 0),
    }));
    return { ...orcamento, itens: itensEnriquecidos };
  }

  private async ensureOrcamento(id: number, empresaId: string): Promise<Orcamento> {
    const orcamento = await this.orcamentoRepo.findOne({ where: { id, empresaId } });
    if (!orcamento) {
      throw new NotFoundException('Orçamento não encontrado');
    }
    return orcamento;
  }
}
