import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './pedido.entity';
import { ItemPedido } from './item-pedido.entity';

type PedidoComTotais = Pedido & {
  totalComissao: number;
  totalLiquido: number;
};

interface PipelineStageDefinition {
  status: string;
  etapa: string;
  probabilidade: number;
  cor: string;
}

@Injectable()
export class PedidosService {
  private readonly pipelineStages: PipelineStageDefinition[] = [
    { status: 'pendente', etapa: 'Prospecção', probabilidade: 0.25, cor: '#6366f1' },
    { status: 'processando', etapa: 'Negociação', probabilidade: 0.45, cor: '#0ea5e9' },
    { status: 'enviado', etapa: 'Proposta enviada', probabilidade: 0.65, cor: '#f59e0b' },
    { status: 'entregue', etapa: 'Fechado ganho', probabilidade: 0.95, cor: '#10b981' },
    { status: 'cancelado', etapa: 'Fechado perdido', probabilidade: 0, cor: '#ef4444' },
  ];

  constructor(
    @InjectRepository(Pedido)
    private pedidoRepo: Repository<Pedido>,
    @InjectRepository(ItemPedido)
    private itemPedidoRepo: Repository<ItemPedido>,
  ) {}

  private calcularTotalComissao(pedido: Pedido): number {
    if (!pedido.itens?.length) {
      return 0;
    }

    return pedido.itens.reduce((acc, item) => {
      const precoUnitario = Number(item.precoUnitario ?? 0);
      const quantidade = Number(item.quantidade ?? 0);
      const subtotal = Number(item.subtotal ?? 0);
      const base = precoUnitario * quantidade;
      const diff = subtotal - base;
      return acc + (Number.isFinite(diff) ? Math.max(diff, 0) : 0);
    }, 0);
  }

  private mapPedidoComTotais(pedido: Pedido): PedidoComTotais {
    const totalComissao = this.calcularTotalComissao(pedido);
    const total = Number(pedido.total ?? 0);
    const totalLiquido = Math.max(total - totalComissao, 0);
    return {
      ...pedido,
      total: total,
      totalComissao,
      totalLiquido,
    };
  }

  async listarPedidos(empresaId: string, status?: string): Promise<PedidoComTotais[]> {
    const where: Partial<Pedido> = { empresaId };
    if (status) {
      where.status = status;
    }

    const pedidos = await this.pedidoRepo.find({
      where,
      relations: ['cliente', 'vendedor', 'itens', 'itens.produto'],
      order: { dataPedido: 'DESC' },
    });

    return pedidos.map((pedido) => this.mapPedidoComTotais(pedido));
  }

  async obterPedido(id: number, empresaId: string): Promise<PedidoComTotais> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id, empresaId },
      relations: ['cliente', 'vendedor', 'itens', 'itens.produto'],
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return this.mapPedidoComTotais(pedido);
  }

  async criar(data: Partial<Pedido>, empresaId: string): Promise<PedidoComTotais> {
    const pedido = this.pedidoRepo.create({
      ...data,
      empresaId,
      dataPedido: data.dataPedido ?? new Date(),
    });
    const salvo = await this.pedidoRepo.save(pedido);
    return this.obterPedido(salvo.id, empresaId);
  }

  async atualizar(id: number, empresaId: string, data: Partial<Pedido>): Promise<PedidoComTotais> {
    const pedido = await this.obterPedido(id, empresaId);
    Object.assign(pedido, data, { empresaId });
    await this.pedidoRepo.save(pedido);
    return this.obterPedido(id, empresaId);
  }

  async excluir(id: number, empresaId: string): Promise<void> {
    const pedido = await this.obterPedido(id, empresaId);
    await this.pedidoRepo.remove(pedido);
  }

  async obterEstatisticas(empresaId: string) {
    const [total, pendentes, concluidos, cancelados, totalVendasRaw, totalComissoesRaw] = await Promise.all([
      this.pedidoRepo.count({ where: { empresaId } }),
      this.pedidoRepo.count({ where: { empresaId, status: 'pendente' } }),
      this.pedidoRepo.count({ where: { empresaId, status: 'concluido' } }),
      this.pedidoRepo.count({ where: { empresaId, status: 'cancelado' } }),
      this.pedidoRepo
        .createQueryBuilder('pedido')
        .where('pedido.empresaId = :empresaId', { empresaId })
        .select('COALESCE(SUM(pedido.total), 0)', 'soma')
        .getRawOne(),
      this.itemPedidoRepo
        .createQueryBuilder('item')
        .innerJoin('item.pedido', 'pedido')
        .where('pedido.empresaId = :empresaId', { empresaId })
        .select('COALESCE(SUM(item.subtotal - (item.precoUnitario * item.quantidade)), 0)', 'soma')
        .getRawOne(),
    ]);

    const totalVendas = Number(totalVendasRaw?.soma ?? 0);
    const totalComissoes = Math.max(Number(totalComissoesRaw?.soma ?? 0), 0);

    return {
      totalPedidos: total,
      pedidosPendentes: pendentes,
      pedidosConcluidos: concluidos,
      pedidosCancelados: cancelados,
      totalVendas,
      totalComissoes,
    };
  }

  async obterPipelineSnapshot(empresaId: string) {
    const pedidos = await this.pedidoRepo.find({
      where: { empresaId },
      relations: ['cliente'],
      order: { updatedAt: 'DESC' },
    });

    const agora = Date.now();
    const toNumber = (value: any) => {
      const num = Number(value ?? 0);
      return Number.isFinite(num) ? num : 0;
    };

    const funil = this.pipelineStages.map((stage) => {
      const pedidosEtapa = pedidos.filter((pedido) => pedido.status === stage.status);
      const quantidade = pedidosEtapa.length;
      const valorTotal = pedidosEtapa.reduce((acc, pedido) => acc + toNumber(pedido.total), 0);
      const tempoMedioDias =
        quantidade > 0
          ? Number(
              (
                pedidosEtapa.reduce((acc, pedido) => {
                  const dataPedido = new Date(pedido.dataPedido ?? pedido.createdAt ?? agora);
                  const diffMs = Math.max(agora - dataPedido.getTime(), 0);
                  return acc + diffMs / (1000 * 60 * 60 * 24);
                }, 0) / quantidade
              ).toFixed(1),
            )
          : 0;

      const valorMedio = quantidade > 0 ? Number((valorTotal / quantidade).toFixed(2)) : 0;

      return {
        status: stage.status,
        etapa: stage.etapa,
        quantidade,
        valorTotal,
        valorMedio,
        probabilidade: stage.probabilidade,
        tempoMedioDias,
        cor: stage.cor,
      };
    });

    const pedidosAberto = pedidos.filter((pedido) => pedido.status !== 'cancelado');
    const totalOportunidades = pedidosAberto.length;
    const valorTotal = pedidosAberto.reduce((acc, pedido) => acc + toNumber(pedido.total), 0);
    const ticketMedio = totalOportunidades > 0 ? Number((valorTotal / totalOportunidades).toFixed(2)) : 0;
    const chanceMedia =
      totalOportunidades > 0
        ? Number(
            (
              pedidosAberto.reduce((acc, pedido) => {
                const stage = this.pipelineStages.find((item) => item.status === pedido.status);
                return acc + (stage?.probabilidade ?? 0);
              }, 0) / totalOportunidades
            ).toFixed(2),
          )
        : 0;

    const topOportunidades = pedidosAberto
      .slice()
      .sort((a, b) => toNumber(b.total) - toNumber(a.total))
      .slice(0, 6)
      .map((pedido) => {
        const stage = this.pipelineStages.find((item) => item.status === pedido.status);
        return {
          id: pedido.id,
          numero: pedido.numero,
          cliente: pedido.cliente?.nome ?? `Cliente #${pedido.clienteId}`,
          valor: toNumber(pedido.total),
          etapa: stage?.etapa ?? pedido.status,
          probabilidade: stage?.probabilidade ?? 0,
          atualizadoEm: pedido.updatedAt,
        };
      });

    const atividadesRecentes = pedidos.slice(0, 12).map((pedido) => {
      const stage = this.pipelineStages.find((item) => item.status === pedido.status);
      return {
        id: pedido.id,
        numero: pedido.numero,
        status: pedido.status,
        etapa: stage?.etapa ?? pedido.status,
        probabilidade: stage?.probabilidade ?? 0,
        cliente: pedido.cliente?.nome ?? `Cliente #${pedido.clienteId}`,
        data: pedido.updatedAt ?? pedido.createdAt,
        valor: toNumber(pedido.total),
      };
    });

    return {
      resumo: {
        totalOportunidades,
        valorTotal,
        ticketMedio,
        chanceMedia,
      },
      funil,
      topOportunidades,
      atividadesRecentes,
    };
  }
}
