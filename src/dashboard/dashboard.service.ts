import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Pedido } from '../pedidos/pedido.entity';
import {
  DashboardStats,
  VendasMensais,
  ClientesNovos,
  ProdutoMaisVendido,
  FaturamentoDiario,
  DistribuicaoCategoria,
} from './dashboard.types';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { PedidosService } from '../pedidos/pedidos.service';
import { endOfMonth, startOfMonth, subMonths } from './date-helpers';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
    @InjectRepository(Pedido)
    private pedidoRepo: Repository<Pedido>,
    private readonly financeiroService: FinanceiroService,
    private readonly pedidosService: PedidosService,
  ) {}

  async getStats(periodo: string | undefined, empresaId: string): Promise<DashboardStats> {
    const dataAtual = new Date();
    const inicioMes = startOfMonth(dataAtual);
    const inicioMesAnterior = startOfMonth(subMonths(dataAtual, 1));
    const fimMesAnterior = endOfMonth(subMonths(dataAtual, 1));

    const [totalProdutos, totalClientes, contasReceber, contasPagar] = await Promise.all([
      this.produtoRepo.count({ where: { empresaId } }),
      this.clienteRepo.count({ where: { empresaId } }),
      this.financeiroService.listarContasReceber(empresaId),
      this.financeiroService.listarContasPagar(empresaId),
    ]);

    const recebidas = contasReceber.filter((conta) => conta.status === 'recebida');
    const totalVendas = recebidas.reduce((acc, conta) => acc + conta.valorPago, 0);
    const pendentes = contasReceber.filter((conta) => conta.status !== 'recebida').length;

    const faturamentoMes = recebidas
      .filter((conta) => new Date(conta.pagamento ?? conta.vencimento) >= inicioMes)
      .reduce((acc, conta) => acc + conta.valorPago, 0);

    const faturamentoMesAnterior = recebidas
      .filter((conta) => {
        const data = new Date(conta.pagamento ?? conta.vencimento);
        return data >= inicioMesAnterior && data <= fimMesAnterior;
      })
      .reduce((acc, conta) => acc + conta.valorPago, 0);

    const crescimentoVendas = faturamentoMesAnterior > 0
      ? ((faturamentoMes - faturamentoMesAnterior) / faturamentoMesAnterior) * 100
      : faturamentoMes > 0
        ? 100
        : 0;

    const ticketMedio = recebidas.length > 0 ? totalVendas / recebidas.length : 0;
    const conversao = contasReceber.length > 0 ? (recebidas.length / contasReceber.length) * 100 : 0;

    return {
      totalVendas,
      clientesAtivos: totalClientes,
      produtosEstoque: totalProdutos,
      pedidosPendentes: pendentes,
      faturamentoMes,
      crescimentoVendas,
      ticketMedio,
      conversao,
    };
  }

  async getVendasMensais(ano: number | undefined, empresaId: string): Promise<VendasMensais[]> {
    const [contas, pedidos] = await Promise.all([
      this.financeiroService.listarContasReceber(empresaId),
      this.pedidoRepo.find({ where: { empresaId } }),
    ]);
    
    const anoReferencia = ano ?? new Date().getFullYear();
    const mesesBase = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const mapa = new Array(12).fill(0).map(() => ({ vendas: 0, pedidos: 0 }));

    contas.forEach((conta) => {
      if (!conta.pagamento && !conta.vencimento) return;
      const data = new Date(conta.pagamento ?? conta.vencimento);
      if (isNaN(data.getTime()) || data.getFullYear() !== anoReferencia) return;
      const mes = data.getMonth();
      const valor = conta.status === 'recebida' ? (conta.valorPago ?? conta.valor ?? 0) : 0;
      mapa[mes].vendas += valor;
      mapa[mes].pedidos += 1;
    });

    pedidos.forEach((pedido) => {
      if (!pedido.dataPedido) return;
      const data = new Date(pedido.dataPedido);
      if (isNaN(data.getTime()) || data.getFullYear() !== anoReferencia) return;
      const mes = data.getMonth();
      const valor = Number(pedido.total ?? 0);
      if (pedido.status !== 'cancelado') {
        mapa[mes].vendas += valor;
        mapa[mes].pedidos += 1;
      }
    });

    return mesesBase.map((nome, index) => ({ mes: nome, vendas: mapa[index].vendas, pedidos: mapa[index].pedidos }));
  }

  async getClientesNovos(periodo: string | undefined, empresaId: string): Promise<ClientesNovos[]> {
    const meses = Number(periodo?.replace('m', '') ?? 6);
    const hoje = new Date();
    const inicio = subMonths(hoje, meses - 1);
    const clientes = await this.clienteRepo.find({
      where: {
        empresaId,
        criadoEm: MoreThanOrEqual(inicio),
      },
      order: { criadoEm: 'ASC' },
    });

    const agrupado: Record<string, number> = {};
    clientes.forEach((cliente) => {
      const chave = `${cliente.criadoEm.getFullYear()}-${String(cliente.criadoEm.getMonth() + 1).padStart(2, '0')}`;
      agrupado[chave] = (agrupado[chave] ?? 0) + 1;
    });

    return Object.entries(agrupado).map(([periodoChave, quantidade]) => ({ periodo: periodoChave, quantidade }));
  }

  async getProdutosMaisVendidos(limite: number | undefined, empresaId: string): Promise<ProdutoMaisVendido[]> {
    const qtd = limite ?? 10;
    const produtos = await this.produtoRepo.find({ where: { empresaId }, order: { estoque: 'ASC' }, take: qtd });
    return produtos.map((produto) => ({
      produto: produto.nome,
      quantidade: Math.max(0, produto.estoqueMinimo ?? 0 - produto.estoque),
      faturamento: produto.preco * Math.max(1, produto.estoque),
    }));
  }

  async getFaturamentoDiario(periodo: string | undefined, empresaId: string): Promise<FaturamentoDiario[]> {
    const dias = Number(periodo?.replace('d', '') ?? 7);
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(inicio.getDate() - dias);
    inicio.setHours(0, 0, 0, 0);

    const [fluxo, pedidos] = await Promise.all([
      this.financeiroService.obterFluxoCaixa(empresaId, dias),
      this.pedidoRepo.find({
        where: { empresaId },
        order: { dataPedido: 'ASC' },
      }),
    ]);

    const historico = fluxo?.historico?.slice(-dias) || [];
    const pedidosFiltrados = pedidos.filter(p => {
      if (!p.dataPedido) return false;
      const data = new Date(p.dataPedido);
      return data >= inicio && p.status !== 'cancelado';
    });

    const mapaFaturamento: Record<string, number> = {};
    
    historico.forEach((item) => {
      const data = item.data || new Date().toISOString().split('T')[0];
      mapaFaturamento[data] = (mapaFaturamento[data] || 0) + ((item.entradas || 0) - (item.saidas || 0));
    });

    pedidosFiltrados.forEach((pedido) => {
      if (!pedido.dataPedido) return;
      const data = new Date(pedido.dataPedido).toISOString().split('T')[0];
      mapaFaturamento[data] = (mapaFaturamento[data] || 0) + Number(pedido.total || 0);
    });

    const resultado: FaturamentoDiario[] = [];
    for (let i = 0; i < dias; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - (dias - 1 - i));
      const dataStr = data.toISOString().split('T')[0];
      resultado.push({
        data: dataStr,
        faturamento: mapaFaturamento[dataStr] || 0
      });
    }

    return resultado;
  }

  async getDistribuicaoCategorias(empresaId: string): Promise<DistribuicaoCategoria[]> {
    const produtos = await this.produtoRepo.find({ where: { empresaId } });
    const total = produtos.length || 1;
    const agrupado: Record<string, { quantidade: number; estoque: number }> = {};

    produtos.forEach((produto) => {
      const chave = produto.categoria ?? 'Sem categoria';
      if (!agrupado[chave]) {
        agrupado[chave] = { quantidade: 0, estoque: 0 };
      }
      agrupado[chave].quantidade += 1;
      agrupado[chave].estoque += produto.estoque;
    });

    return Object.entries(agrupado).map(([categoria, info]) => ({
      categoria,
      quantidade: info.quantidade,
      percentual: (info.quantidade / total) * 100,
      faturamento: info.estoque,
    }));
  }

  async getInsights(empresaId: string) {
    const estoqueBaixo = await this.produtoRepo.count({ where: { empresaId, estoque: 0 } });
    const contasAtrasadas = (await this.financeiroService.listarContasPagar(empresaId, { status: 'atrasada' })).length;
    const clientesRecentes = await this.clienteRepo.count({
      where: {
        empresaId,
        criadoEm: MoreThanOrEqual(subMonths(new Date(), 1)),
      },
    });

    return {
      produtosBaixoEstoque: estoqueBaixo,
      crescimentoSemanal: clientesRecentes,
      clienteTop: clientesRecentes > 0 ? 'Cliente recém-adquirido' : null,
      alertas: contasAtrasadas > 0 ? [`${contasAtrasadas} contas a pagar em atraso`] : [],
    };
  }

  async getRelatorioVendas(periodo: string | undefined, empresaId: string) {
    const dias = Number(periodo?.replace('d', '') ?? 30);
    const fluxo = await this.financeiroService.obterFluxoCaixa(empresaId, dias);
    return {
      vendas: fluxo.historico,
      vendedores: [],
    };
  }

  async getRelatorioClientes(periodo: string | undefined, empresaId: string) {
    const dias = Number(periodo?.replace('d', '') ?? 30);
    const inicio = subMonths(new Date(), Math.ceil(dias / 30));
    const clientes = await this.clienteRepo.find({ where: { empresaId, criadoEm: MoreThanOrEqual(inicio) } });
    return {
      clientes,
      porEstado: [],
      porCategoria: [],
    };
  }

  async getRelatorioEstoque(periodo: string | undefined, empresaId: string) {
    const produtos = await this.produtoRepo.find({ where: { empresaId } });
    const estoqueBaixo = await this.produtoRepo.find({
      where: { empresaId },
    }).then(prods => prods.filter(p => p.estoque <= p.estoqueMinimo));
    
    const valorTotalEstoque = produtos.reduce((acc, p) => {
      const valor = Number(p.precoCusto || p.preco || 0) * p.estoque;
      return acc + valor;
    }, 0);

    const movimentacoesPorTipo = [
      { tipo: 'Entrada', quantidade: 0 },
      { tipo: 'Saída', quantidade: 0 },
      { tipo: 'Ajuste', quantidade: 0 },
    ];

    const movimentacoesPorMes: Array<{ mes: string; entradas: number; saidas: number }> = [];

    return {
      produtos,
      movimentacoes: [],
      movimentacoesPorTipo,
      movimentacoesPorMes,
      categorias: await this.getDistribuicaoCategorias(empresaId),
      resumo: {
        totalProdutos: produtos.length,
        produtosEstoqueBaixo: estoqueBaixo.length,
        valorTotalEstoque: Number(valorTotalEstoque.toFixed(2)),
        totalMovimentacoes: 0,
        entradas: 0,
        saidas: 0,
      },
      depositos: [],
    };
  }

  async getRelatorioFinanceiro(periodo: string | undefined, tipo = 'todos', empresaId: string) {
    const dias = Number(periodo?.replace('d', '') ?? 30);
    const fluxo = await this.financeiroService.obterFluxoCaixa(empresaId, dias);
    return {
      movimentacoes: fluxo.historico,
      categorias: tipo === 'receber' ? await this.financeiroService.listarContasReceber(empresaId) : await this.financeiroService.listarContasPagar(empresaId),
      fluxoCaixa: fluxo,
    };
  }

  async getRelatorioCompras(empresaId: string) {
    const contas = await this.financeiroService.listarContasPagar(empresaId);
    return {
      relatorios: contas,
    };
  }
}