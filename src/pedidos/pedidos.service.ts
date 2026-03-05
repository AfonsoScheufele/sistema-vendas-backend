import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Pedido } from './pedido.entity';
import { ItemPedido } from './item-pedido.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Produto } from '../produtos/produto.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Usuario } from '../auth/usuario.entity';
import { Perfil } from '../perfis/perfil.entity';
import { FiscalService } from '../fiscal/fiscal.service';
import { CreditoService } from '../credito/credito.service';
import { MetasService } from '../metas/metas.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';

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
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Perfil)
    private perfilRepo: Repository<Perfil>,
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => FiscalService))
    private fiscalService: FiscalService,
    private creditoService: CreditoService,
    private metasService: MetasService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private readonly logger = new Logger(PedidosService.name);

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

  async criar(createPedidoDto: CreatePedidoDto, empresaId: string): Promise<PedidoComTotais> {
    if (!empresaId) {
      throw new BadRequestException('Empresa não identificada. Por favor, selecione uma empresa.');
    }

    return this.dataSource.transaction(async (manager: EntityManager) => {
      const { clienteId, itens, desconto = 0, frete = 0 } = createPedidoDto;

      const cliente = await manager.findOne(Cliente, {
        where: { id: clienteId, empresaId },
      });
      if (!cliente) {
        throw new NotFoundException('Cliente não encontrado.');
      }

      let subtotalPrevio = 0;
      const itensDetalhados: { produto: Produto; dto: any }[] = [];

      if (!itens || itens.length === 0) {
        throw new BadRequestException('Adicione pelo menos um item ao pedido.');
      }

      for (const itemDto of itens) {
        const produto = await manager.findOne(Produto, {
          where: { id: itemDto.produtoId },
        });

        if (!produto) {
          throw new NotFoundException(`Produto com ID ${itemDto.produtoId} não encontrado.`);
        }
        if (produto.empresaId !== empresaId) {
          throw new BadRequestException(`Produto com ID ${itemDto.produtoId} não pertence à empresa selecionada.`);
        }

        const qtd = Number(itemDto.quantidade || 0);
        if (qtd <= 0) {
          throw new BadRequestException(`Quantidade inválida para o produto ${produto.nome}.`);
        }
        const estoqueDisponivel = Number(produto.estoque ?? 0);
        if (estoqueDisponivel < qtd) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto "${produto.nome}". Estoque disponível: ${estoqueDisponivel}, solicitado: ${qtd}.`
          );
        }

        const preco = Number(itemDto.precoUnitario || produto.preco || 0);
        subtotalPrevio += qtd * preco;
        itensDetalhados.push({ produto, dto: { ...itemDto, precoUnitario: preco } });
      }

      const totalEstimado = Math.max(subtotalPrevio - (subtotalPrevio * Number(desconto)) / 100 + Number(frete), 0);

      const credito = await this.creditoService.verificarCredito(
        Number(clienteId),
        empresaId,
        totalEstimado,
      );

      if (credito.bloqueado && credito.acao === 'bloqueio_total') {
        throw new BadRequestException(
          credito.mensagem ?? 'Cliente bloqueado por inadimplência. Entre em contato com o financeiro.',
        );
      }

      const aguardandoLiberacao = credito.bloqueado && credito.acao === 'alcada';

      const ultimoPedido = await manager.findOne(Pedido, {
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

      const pedido = new Pedido();
      pedido.numero = numero;
      pedido.clienteId = clienteId;
      pedido.vendedorId = createPedidoDto.vendedorId ? Number(createPedidoDto.vendedorId) : null;
      pedido.empresaId = empresaId;
      pedido.total = Number(totalEstimado.toFixed(2));
      pedido.status = createPedidoDto.status || 'pendente';
      pedido.statusPagamento = createPedidoDto.statusPagamento || 'pendente';
      pedido.dataPedido = createPedidoDto.dataPedido ? new Date(createPedidoDto.dataPedido) : new Date();
      pedido.dataSaida = createPedidoDto.dataSaida ? new Date(createPedidoDto.dataSaida) : null;
      pedido.dataEntregaPrevista = createPedidoDto.dataEntregaPrevista ? new Date(createPedidoDto.dataEntregaPrevista) : null;
      pedido.desconto = Number(Number(desconto ?? 0).toFixed(2));
      pedido.frete = Number(Number(frete ?? 0).toFixed(2));
      pedido.condicaoPagamento = createPedidoDto.condicaoPagamento;
      pedido.formaPagamento = createPedidoDto.formaPagamento;
      pedido.observacoes = createPedidoDto.observacoes;
      pedido.enderecoEntrega = createPedidoDto.enderecoEntrega;
      pedido.transportadora = createPedidoDto.transportadora;
      pedido.origem = createPedidoDto.origem;
      pedido.aguardandoLiberacaoCredito = aguardandoLiberacao;

      const pedidoSalvo = await manager.save(Pedido, pedido);
      const produtosComEstoqueBaixo: Array<{ produto: Produto; estoqueAnterior: number; estoqueAtual: number }> = [];
      const avisosEstoque: Array<any> = [];

      for (const { produto, dto } of itensDetalhados) {
        const precoUnit = Number(dto.precoUnitario ?? 0);
        const qtd = Number(dto.quantidade ?? 0);
        const itemEntity = manager.create(ItemPedido, {
          produtoId: produto.id,
          pedidoId: pedidoSalvo.id,
          quantidade: qtd,
          precoUnitario: Number(precoUnit.toFixed(2)),
          subtotal: Number((qtd * precoUnit).toFixed(2)),
          comissao: Number(Number(dto.comissao ?? 0).toFixed(2)),
        });
        await manager.save(ItemPedido, itemEntity);

        if (!aguardandoLiberacao) {
          const estoqueAtual = Number(produto.estoque ?? 0);
          const qtdBaixa = Number(dto.quantidade);
          const novoEstoque = Math.max(0, estoqueAtual - qtdBaixa);
          produto.estoque = novoEstoque;
          await manager.save(Produto, produto);

          const estoqueMinimo = Number(produto.estoqueMinimo ?? 0);
          if (novoEstoque <= estoqueMinimo) {
            produtosComEstoqueBaixo.push({
              produto,
              estoqueAnterior: estoqueAtual,
              estoqueAtual: novoEstoque,
            });
            avisosEstoque.push({
              produto: produto.nome,
              ficaraSemEstoque: novoEstoque === 0,
              ficaraEstoqueBaixo: true,
              estoqueRestante: novoEstoque,
              estoqueMinimo,
            });
          }
        }
      }

      (pedidoSalvo as any).avisosEstoque = avisosEstoque;

      return { pedidoSalvo, produtosComEstoqueBaixo, aguardandoLiberacao };
    })
    .then(async ({ pedidoSalvo, produtosComEstoqueBaixo, aguardandoLiberacao }) => {
        this.notificarPedidoCriado(pedidoSalvo, empresaId).catch(err => 
            this.logger.error(`Erro ao notificar pedido criado: ${err.message}`, err.stack)
        );

        if (produtosComEstoqueBaixo.length > 0) {
            this.notificarEstoqueBaixo(produtosComEstoqueBaixo, empresaId).catch(err => 
                this.logger.error(`Erro ao notificar estoque baixo: ${err.message}`, err.stack)
            );
        }

        if (!aguardandoLiberacao) {
             this.criarNotaFiscalAutomatica(pedidoSalvo, empresaId).catch(err => 
                this.logger.error(`Erro ao criar NF automática: ${err.message}`, err.stack)
            );
        }
        
        if (aguardandoLiberacao) {
             const pedidoRetornado = await this.obterPedido(pedidoSalvo.id, empresaId);
            (pedidoRetornado as any).aguardandoLiberacaoCredito = true;
            (pedidoRetornado as any).mensagemCredit = 'Pedido criado e aguardando liberação do financeiro.';
            return pedidoRetornado;
        }

        return this.obterPedido(pedidoSalvo.id, empresaId);
    })
    .catch((error) => {
        this.logger.error(`Erro ao criar pedido: ${error.message}`, error.stack);
        throw error instanceof BadRequestException || error instanceof NotFoundException
            ? error
            : new BadRequestException('Erro ao processar pedido.');
    });
  }

  async atualizar(id: number, empresaId: string, data: Partial<Pedido>): Promise<PedidoComTotais> {
    const pedido = await this.obterPedido(id, empresaId);
    Object.assign(pedido, data, { empresaId });
    await this.pedidoRepo.save(pedido);
    return this.obterPedido(id, empresaId);
  }

  async listarAguardandoLiberacao(empresaId: string): Promise<PedidoComTotais[]> {
    const pedidos = await this.pedidoRepo.find({
      where: { empresaId, aguardandoLiberacaoCredito: true },
      relations: ['cliente', 'vendedor', 'itens', 'itens.produto'],
      order: { dataPedido: 'DESC' },
    });
    return pedidos.map((p) => this.mapPedidoComTotais(p));
  }

  async liberarCredito(
    id: number,
    empresaId: string,
    aprovado: boolean,
    usuarioId: number,
    motivo?: string,
  ): Promise<PedidoComTotais> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id, empresaId, aguardandoLiberacaoCredito: true },
      relations: ['itens', 'itens.produto'],
    });
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado ou já foi processado.');
    }

    pedido.aguardandoLiberacaoCredito = false;
    pedido.liberadoPor = usuarioId;
    pedido.liberadoEm = new Date();
    pedido.motivoLiberacao = motivo ?? (aprovado ? 'Liberado pelo financeiro' : 'Rejeitado pelo financeiro');
    await this.pedidoRepo.save(pedido);

    if (!aprovado) {
      pedido.status = 'cancelado';
      await this.pedidoRepo.save(pedido);
      return this.obterPedido(id, empresaId);
    }

    for (const item of pedido.itens ?? []) {
      const produto = await this.produtoRepo.findOne({
        where: { id: item.produtoId, empresaId },
      });
      if (!produto) continue;
      const estoqueAtual = Number(produto.estoque ?? 0);
      const qtd = Number(item.quantidade ?? 0);
      if (estoqueAtual < qtd) {
        throw new BadRequestException(
          `Estoque insuficiente para aprovar o pedido. Produto "${produto.nome}": disponível ${estoqueAtual}, necessário ${qtd}. Aprovação cancelada.`
        );
      }
      await this.produtoRepo.decrement(
        { id: item.produtoId, empresaId },
        'estoque',
        qtd,
      );
    }

    try {
      await this.criarNotaFiscalAutomatica(pedido, empresaId);
    } catch (nfError: any) {
      console.error('[PedidosService] Erro ao criar NF após liberação:', nfError);
    }

    await this.notificarPedidoCriado(pedido, empresaId);

    // Atualiza na hora as metas do grupo do vendedor (faturamento/vendas)
    this.metasService
      .atualizarMetasPorPedidoConfirmado(empresaId, pedido.vendedorId ?? null, pedido.dataPedido)
      .catch((err) => this.logger.warn('Erro ao atualizar metas por pedido confirmado:', err));

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
      const deveDevolverEstoque =
        pedido.aguardandoLiberacaoCredito === false ||
        pedido.status !== 'cancelado';
      if (deveDevolverEstoque) {
        for (const item of pedido.itens) {
          const quantidadeAdicionar = Number(item.quantidade);
          if (quantidadeAdicionar <= 0) continue;
          await this.produtoRepo.increment(
            { id: item.produtoId, empresaId },
            'estoque',
            quantidadeAdicionar,
          );
        }
      }
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

  private async obterUsuariosComPermissao(permissao: string): Promise<Usuario[]> {
    try {
      const usuarios = await this.usuarioRepo.find({
        where: { ativo: true },
        relations: [],
      });

      const usuariosComPermissao: Usuario[] = [];

      for (const usuario of usuarios) {
        if (usuario.role === 'Admin') {
          usuariosComPermissao.push(usuario);
          continue;
        }

        const perfil = await this.perfilRepo.findOne({
          where: { nome: usuario.role },
        });

        if (!perfil || !perfil.permissoes) continue;

        const permissoes = (perfil.permissoes || [])
          .map((p: string) => (p || '').trim())
          .filter((p: string) => p.length > 0);

        if (permissoes.includes(permissao)) {
          usuariosComPermissao.push(usuario);
        }
      }

      return usuariosComPermissao;
    } catch (error) {
      console.error(`[PedidosService] Erro ao buscar usuários com permissão ${permissao}:`, error);
      return [];
    }
  }

  private async notificarPedidoCriado(pedido: Pedido, empresaId: string): Promise<void> {
    try {
      const usuarios = await this.obterUsuariosComPermissao('pedidos.notificacao');
      const cliente = await this.clienteRepo.findOne({ where: { id: pedido.clienteId } });

      for (const usuario of usuarios) {
        await this.notificationsService.criarNotificacao(
          usuario.id,
          '📦 Novo Pedido Criado',
          `Pedido ${pedido.numero} criado para ${cliente?.nome || 'Cliente'}. Valor total: R$ ${Number(pedido.total).toFixed(2)}`,
          'info',
          'normal',
        );
      }
    } catch (error) {
      this.logger.error(`[PedidosService] Erro ao notificar criação de pedido: ${error}`, error);
    }
  }

  private async notificarEstoqueBaixo(
    produtos: Array<{ produto: Produto; estoqueAnterior: number; estoqueAtual: number }>,
    empresaId: string,
  ): Promise<void> {
    try {
      const usuarios = await this.obterUsuariosComPermissao('estoque.baixo');

      for (const { produto, estoqueAtual } of produtos) {
        const estoqueMinimo = produto.estoqueMinimo || 0;
        const estaSemEstoque = estoqueAtual === 0;
        const titulo = estaSemEstoque
          ? '🚨 Produto Sem Estoque'
          : '⚠️ Estoque Baixo';
        const mensagem = estaSemEstoque
          ? `O produto "${produto.nome}" ficou sem estoque após o pedido.`
          : `O produto "${produto.nome}" está com estoque baixo (${estoqueAtual} unidades). Estoque mínimo: ${estoqueMinimo}`;

        for (const usuario of usuarios) {
          await this.notificationsService.criarNotificacao(
            usuario.id,
            titulo,
            mensagem,
            estaSemEstoque ? 'error' : 'warning',
            'high',
          );
        }
      }
    } catch (error) {
      this.logger.error(`[PedidosService] Erro ao notificar estoque baixo: ${error}`, error);
    }
  }

  /**
   * Gera nota fiscal automaticamente para um pedido já salvo.
   * Usado após criar pedido normal ou após venda no PDV.
   */
  async gerarNotaFiscalParaPedido(pedidoId: number, empresaId: string): Promise<void> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id: pedidoId, empresaId },
      relations: ['itens', 'itens.produto', 'cliente'],
    });
    if (pedido) {
      await this.criarNotaFiscalAutomatica(pedido, empresaId);
    }
  }

  private async criarNotaFiscalAutomatica(pedido: Pedido, empresaId: string): Promise<void> {
    try {
      const pedidoCompleto = await this.pedidoRepo.findOne({
        where: { id: pedido.id, empresaId },
        relations: ['itens', 'itens.produto', 'cliente'],
      });

      if (!pedidoCompleto || !pedidoCompleto.itens || pedidoCompleto.itens.length === 0) {
        return;
      }

      const nfsExistentes = await this.fiscalService.listarNotasFiscais(empresaId, {});
      const nfJaExiste = nfsExistentes.some(nf => (nf as any).pedidoId === pedidoCompleto.id);
      
      if (nfJaExiste) {
        return;
      }

      const proximoNumero = nfsExistentes.length > 0 
        ? Math.max(...nfsExistentes.map(nf => parseInt(nf.numero) || 0)) + 1
        : 1;

      const itensNF = pedidoCompleto.itens.map(item => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        valorUnitario: Number(item.precoUnitario),
        valorTotal: Number(item.subtotal),
        descricao: item.produto?.nome || `Produto ID: ${item.produtoId}`,
      }));

      await this.fiscalService.criarNotaFiscal(empresaId, {
        numero: proximoNumero.toString(),
        serie: '001',
        tipo: 'saida',
        chaveAcesso: '',
        clienteId: pedidoCompleto.clienteId,
        valorTotal: Number(pedidoCompleto.total),
        status: 'autorizada',
        dataEmissao: new Date(),
        dataAutorizacao: new Date(),
        observacoes: `NF gerada automaticamente a partir do pedido ${pedidoCompleto.numero}`,
        pedidoId: pedidoCompleto.id,
        itens: itensNF,
      });
    } catch (error: any) {
      this.logger.error(`[PedidosService] ❌ Erro ao criar NF automática para pedido ${pedido.id}:`, error);
    }
  }
}
