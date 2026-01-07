import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './pedido.entity';
import { ItemPedido } from './item-pedido.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Produto } from '../produtos/produto.entity';

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
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
  ) {}

  private calcularTotalComissao(pedido: Pedido): number {
    if (!pedido.itens?.length) {
      return 0;
    }

    return pedido.itens.reduce((acc, item) => {
      const subtotal = Number(item.subtotal ?? 0);
      const comissaoPercentual = Number(item.comissao ?? 0);
      const valorComissao = (subtotal * comissaoPercentual) / 100;
      return acc + (Number.isFinite(valorComissao) ? valorComissao : 0);
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

  async criar(data: any, empresaId: string): Promise<PedidoComTotais> {
    if (!empresaId) {
      throw new BadRequestException('Empresa não identificada. Por favor, selecione uma empresa.');
    }

    if (!data.clienteId) {
      throw new BadRequestException('Cliente é obrigatório.');
    }

    // Verificar se o cliente existe
    const cliente = await this.clienteRepo.findOne({
      where: { id: data.clienteId, empresaId },
    });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    if (!data.itens || data.itens.length === 0) {
      throw new BadRequestException('Adicione pelo menos um item ao pedido.');
    }

    // Gerar número do pedido
    const ultimoPedido = await this.pedidoRepo.findOne({
      where: { empresaId },
      order: { id: 'DESC' },
    });
    
    let numeroSequencial = 1;
    if (ultimoPedido && ultimoPedido.numero) {
      const numeroExtraido = ultimoPedido.numero.replace(/\D/g, '');
      if (numeroExtraido) {
        numeroSequencial = parseInt(numeroExtraido, 10) + 1;
      }
    }
    
    const numero = `PED-${numeroSequencial.toString().padStart(6, '0')}`;
    
    if (!numero || numero.trim() === '') {
      throw new BadRequestException('Erro ao gerar número do pedido.');
    }

    // Calcular total dos itens e validar produtos
    let subtotal = 0;
    const itensParaCriar = await Promise.all(
      (data.itens || []).map(async (item: any) => {
        if (!item.produtoId) {
          throw new BadRequestException('Produto é obrigatório em todos os itens.');
        }

        // Verificar se o produto existe
        const produto = await this.produtoRepo.findOne({
          where: { id: item.produtoId },
        });
        if (!produto) {
          throw new NotFoundException(`Produto com ID ${item.produtoId} não encontrado.`);
        }
        if (produto.empresaId !== empresaId) {
          throw new BadRequestException(`Produto com ID ${item.produtoId} não pertence à empresa selecionada.`);
        }

        const precoUnitario = Number(item.precoUnitario || produto.preco || 0);
        const quantidade = Number(item.quantidade || 0);
        if (quantidade <= 0) {
          throw new BadRequestException('Quantidade deve ser maior que zero.');
        }
        const subtotalItem = precoUnitario * quantidade;
        subtotal += subtotalItem;
        
        const comissaoPercentual = Number(item.comissao || 0);
        
        return {
          produtoId: item.produtoId,
          quantidade,
          precoUnitario,
          subtotal: subtotalItem,
          comissao: comissaoPercentual,
        };
      })
    );

    // Aplicar desconto e frete
    const desconto = Number(data.desconto || 0);
    const frete = Number(data.frete || 0);
    const descontoValor = (subtotal * desconto) / 100;
    const total = Math.max(subtotal - descontoValor + frete, 0);

    try {
      // Criar o pedido
      const pedido = new Pedido();
      pedido.numero = String(numero);
      pedido.clienteId = Number(data.clienteId);
      pedido.vendedorId = data.vendedorId ? Number(data.vendedorId) : null;
      pedido.empresaId = String(empresaId);
      pedido.total = Number(total.toFixed(2));
      pedido.status = String(data.status || 'pendente');
      pedido.statusPagamento = String(data.statusPagamento || 'pendente');
      pedido.dataPedido = data.dataPedido ? new Date(data.dataPedido) : new Date();
      pedido.dataSaida = data.dataSaida ? new Date(data.dataSaida) : null;
      pedido.dataEntregaPrevista = data.dataEntregaPrevista ? new Date(data.dataEntregaPrevista) : null;
      pedido.desconto = Number(desconto.toFixed(2));
      pedido.frete = Number(frete.toFixed(2));
      pedido.condicaoPagamento = data.condicaoPagamento ? String(data.condicaoPagamento) : null;
      pedido.formaPagamento = data.formaPagamento ? String(data.formaPagamento) : null;
      pedido.observacoes = data.observacoes ? String(data.observacoes) : null;
      pedido.enderecoEntrega = data.enderecoEntrega ? String(data.enderecoEntrega) : null;
      pedido.transportadora = data.transportadora ? String(data.transportadora) : null;
      pedido.origem = data.origem ? String(data.origem) : null;

      const pedidoSalvo = await this.pedidoRepo.save(pedido);

      // Criar os itens do pedido
      const itens = itensParaCriar.map((item: any) =>
        this.itemPedidoRepo.create({
          produtoId: item.produtoId,
          pedidoId: pedidoSalvo.id,
          quantidade: item.quantidade,
          precoUnitario: Number(item.precoUnitario.toFixed(2)),
          subtotal: Number(item.subtotal.toFixed(2)),
          comissao: Number(item.comissao.toFixed(2)),
        })
      );

      await this.itemPedidoRepo.save(itens);

      return this.obterPedido(pedidoSalvo.id, empresaId);
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      throw new BadRequestException(
        error.message || 'Erro ao criar pedido. Verifique os dados e tente novamente.'
      );
    }
  }

  async atualizar(id: number, empresaId: string, data: Partial<Pedido>): Promise<PedidoComTotais> {
    const pedido = await this.obterPedido(id, empresaId);
    Object.assign(pedido, data, { empresaId });
    await this.pedidoRepo.save(pedido);
    return this.obterPedido(id, empresaId);
  }

  async excluir(id: number, empresaId: string): Promise<void> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id, empresaId },
      relations: ['itens'],
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }
    
    if (pedido.itens && pedido.itens.length > 0) {
      await this.itemPedidoRepo.remove(pedido.itens);
    }
    
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
        .select('COALESCE(SUM((item.subtotal * item.comissao) / 100), 0)', 'soma')
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
