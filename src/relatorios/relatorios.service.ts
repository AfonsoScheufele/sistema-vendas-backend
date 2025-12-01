import { Injectable } from '@nestjs/common';
import { PedidosService } from '../pedidos/pedidos.service';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { ContratosService } from '../compras/contratos/contratos.service';
import { EstoqueService } from '../estoque/estoque.service';
import { ClientesService } from '../clientes/clientes.service';
import { FornecedoresService } from '../compras/fornecedores/fornecedores.service';
import { OrcamentosService } from '../orcamentos/orcamentos.service';
import { ProdutosService } from '../produtos/produtos.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';

@Injectable()
export class RelatoriosService {
  constructor(
    private readonly pedidosService: PedidosService,
    private readonly financeiroService: FinanceiroService,
    private readonly contratosService: ContratosService,
    private readonly estoqueService: EstoqueService,
    private readonly clientesService: ClientesService,
    private readonly fornecedoresService: FornecedoresService,
    private readonly orcamentosService: OrcamentosService,
    private readonly produtosService: ProdutosService,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async obterDashboard(empresaId: string) {
    const [
      vendasEstatisticas,
      pipeline,
      contasReceberStats,
      contasPagarStats,
      fluxoCaixa,
      resumoBancos,
      contasBancarias,
      contratosStats,
      estoqueStats,
      investimentos,
    ] = await Promise.all([
      this.pedidosService.obterEstatisticas(empresaId),
      this.pedidosService.obterPipelineSnapshot(empresaId),
      this.financeiroService.obterEstatisticas(empresaId),
      this.financeiroService.obterEstatisticasPagar(empresaId),
      this.financeiroService.obterFluxoCaixa(empresaId, 45),
      this.financeiroService.obterDashboardBancos(empresaId),
      Promise.resolve(this.financeiroService.listarContasBancarias(empresaId)),
      this.contratosService.obterEstatisticas(empresaId),
      this.estoqueService.obterEstatisticas(empresaId),
      this.financeiroService.obterInvestimentos(empresaId),
    ]);

    const receitaLiquida = contasReceberStats.totalRecebido - contasPagarStats.totalPago;
    const saldoDisponivel = resumoBancos.saldoDisponivel;
    const saldoProjetado = resumoBancos.saldoProjetado + fluxoCaixa.resumo.saldo;

    const indicadores = [
      {
        label: 'Receita líquida recebida',
        valor: receitaLiquida,
        formato: 'currency' as const,
      },
      {
        label: 'Saldo disponível em caixa',
        valor: saldoDisponivel,
        formato: 'currency' as const,
      },
      {
        label: 'Saldo projetado',
        valor: saldoProjetado,
        formato: 'currency' as const,
      },
      {
        label: 'Ticket médio',
        valor: pipeline.resumo.ticketMedio,
        formato: 'currency' as const,
      },
      {
        label: 'Chance média de conversão',
        valor: pipeline.resumo.chanceMedia * 100,
        formato: 'percent' as const,
      },
      {
        label: 'Contratos vigentes',
        valor: contratosStats.vigentes ?? 0,
        formato: 'number' as const,
      },
    ];

    return {
      vendas: {
        estatisticas: vendasComPipeline(vendasEstatisticas, pipeline.resumo),
        pipeline,
      },
      financeiro: {
        receber: contasReceberStats,
        pagar: contasPagarStats,
        fluxoCaixa,
        bancos: {
          resumo: resumoBancos,
          contas: contasBancarias,
        },
        investimentos: {
          resumo: investimentos.resumo,
          distribuicao: investimentos.distribuicao,
          alertas: investimentos.alertas.slice(0, 5),
        },
      },
      compras: {
        contratos: contratosStats,
      },
      estoque: estoqueStats,
      indicadores,
    };
  }

  async obterRelatorioVendas(empresaId: string, filtros?: { periodo?: string; vendedorId?: string }) {
    const [estatisticas, pipeline, pedidos] = await Promise.all([
      this.pedidosService.obterEstatisticas(empresaId),
      this.pedidosService.obterPipelineSnapshot(empresaId),
      this.pedidosService.listarPedidos(empresaId),
    ]);

    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    const pedidosFiltrados = pedidos.filter((p) => {
      const dataPedido = new Date(p.dataPedido || (p as any).createdAt || '');
      if (dataPedido < dataInicio) return false;
      if (filtros?.vendedorId && p.vendedorId?.toString() !== filtros.vendedorId) return false;
      return true;
    });

    const vendasPorDia = new Map<string, number>();
    const vendasPorVendedor = new Map<string, { quantidade: number; valor: number }>();
    const vendasPorStatus = new Map<string, { quantidade: number; valor: number }>();

    pedidosFiltrados.forEach((pedido) => {
      const data = new Date(pedido.dataPedido || (pedido as any).createdAt || '').toISOString().split('T')[0];
      const valorAtual = vendasPorDia.get(data) || 0;
      vendasPorDia.set(data, valorAtual + (pedido.total || 0));

      const vendedorKey = pedido.vendedorId?.toString() || 'sem-vendedor';
      const vendedorAtual = vendasPorVendedor.get(vendedorKey) || { quantidade: 0, valor: 0 };
      vendasPorVendedor.set(vendedorKey, {
        quantidade: vendedorAtual.quantidade + 1,
        valor: vendedorAtual.valor + (pedido.total || 0),
      });

      const statusKey = pedido.status || 'sem-status';
      const statusAtual = vendasPorStatus.get(statusKey) || { quantidade: 0, valor: 0 };
      vendasPorStatus.set(statusKey, {
        quantidade: statusAtual.quantidade + 1,
        valor: statusAtual.valor + (pedido.total || 0),
      });
    });

    const totalVendas = pedidosFiltrados.reduce((acc, p) => acc + (p.total || 0), 0);
    const ticketMedio = pedidosFiltrados.length > 0 ? totalVendas / pedidosFiltrados.length : 0;

    return {
      periodo: { inicio: dataInicio.toISOString().split('T')[0], fim: new Date().toISOString().split('T')[0] },
      resumo: {
        totalPedidos: pedidosFiltrados.length,
        totalVendas,
        ticketMedio,
        pedidosConcluidos: pedidosFiltrados.filter((p) => p.status === 'entregue' || p.status === 'concluido').length,
        pedidosPendentes: pedidosFiltrados.filter((p) => p.status === 'pendente' || p.status === 'processando').length,
      },
      estatisticas,
      pipeline,
      vendasPorDia: Array.from(vendasPorDia.entries()).map(([data, valor]) => ({ data, valor })),
      vendasPorVendedor: Array.from(vendasPorVendedor.entries()).map(([vendedorId, dados]) => ({
        vendedorId,
        ...dados,
      })),
      vendasPorStatus: Array.from(vendasPorStatus.entries()).map(([status, dados]) => ({ status, ...dados })),
      topPedidos: pedidosFiltrados
        .sort((a, b) => (b.total || 0) - (a.total || 0))
        .slice(0, 10)
        .map((p) => ({
          id: p.id,
          numero: p.numero,
          cliente: typeof p.cliente === 'string' ? p.cliente : p.cliente?.nome || 'N/A',
          valor: p.total || 0,
          status: p.status,
          data: p.dataPedido || (p as any).createdAt || '',
        })),
    };
  }

  async obterRelatorioClientes(empresaId: string, filtros?: { periodo?: string }) {
    const clientes = await this.clientesService.findAll(empresaId);
    const pedidos = await this.pedidosService.listarPedidos(empresaId);

    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    const pedidosFiltrados = pedidos.filter((p) => {
      const dataPedido = new Date(p.dataPedido || (p as any).createdAt || '');
      return dataPedido >= dataInicio;
    });

    const clientesComVendas = new Map<
      number,
      { cliente: any; totalVendas: number; quantidadePedidos: number; ultimaCompra?: string }
    >();

    pedidosFiltrados.forEach((pedido) => {
      const clienteId = pedido.clienteId;
      const atual = clientesComVendas.get(clienteId) || {
        cliente: clientes.find((c) => c.id === clienteId),
        totalVendas: 0,
        quantidadePedidos: 0,
      };
      atual.totalVendas += pedido.total || 0;
      atual.quantidadePedidos += 1;
      const dataPedido = pedido.dataPedido || (pedido as any).createdAt || '';
      if (!atual.ultimaCompra || dataPedido > atual.ultimaCompra) {
        atual.ultimaCompra = dataPedido;
      }
      clientesComVendas.set(clienteId, atual);
    });

    const topClientes = Array.from(clientesComVendas.values())
      .sort((a, b) => b.totalVendas - a.totalVendas)
      .slice(0, 20);

    const clientesAtivos = clientesComVendas.size;
    const clientesInativos = clientes.length - clientesAtivos;
    const ticketMedioCliente =
      clientesAtivos > 0 ? topClientes.reduce((acc, c) => acc + c.totalVendas, 0) / clientesAtivos : 0;

    return {
      periodo: { inicio: dataInicio.toISOString().split('T')[0], fim: new Date().toISOString().split('T')[0] },
      resumo: {
        totalClientes: clientes.length,
        clientesAtivos,
        clientesInativos,
        ticketMedioCliente,
        totalVendas: topClientes.reduce((acc, c) => acc + c.totalVendas, 0),
      },
      topClientes: topClientes.map((c) => ({
        id: c.cliente?.id,
        nome: c.cliente?.nome || 'N/A',
        email: c.cliente?.email,
        totalVendas: c.totalVendas,
        quantidadePedidos: c.quantidadePedidos,
        ultimaCompra: c.ultimaCompra,
      })),
      distribuicaoPorTipo: clientes.reduce(
        (acc, c) => {
          acc[c.tipo || 'outro'] = (acc[c.tipo || 'outro'] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async obterRelatorioFinanceiro(empresaId: string, filtros?: { periodo?: string; tipo?: string }) {
    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;

    const [contasReceber, contasPagar, fluxoCaixa, receberStats, pagarStats] = await Promise.all([
      this.financeiroService.listarContasReceber(empresaId),
      this.financeiroService.listarContasPagar(empresaId),
      this.financeiroService.obterFluxoCaixa(empresaId, dias),
      this.financeiroService.obterEstatisticas(empresaId),
      this.financeiroService.obterEstatisticasPagar(empresaId),
    ]);

    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    const receberFiltradas = contasReceber.filter((c) => {
      const data = new Date(c.vencimento);
      return data >= dataInicio;
    });

    const pagarFiltradas = contasPagar.filter((c) => {
      const data = new Date(c.vencimento);
      return data >= dataInicio;
    });

    const receitasPorMes = new Map<string, number>();
    const despesasPorMes = new Map<string, number>();

    receberFiltradas.forEach((conta) => {
      const mes = new Date(conta.vencimento).toISOString().slice(0, 7);
      const atual = receitasPorMes.get(mes) || 0;
      receitasPorMes.set(mes, atual + (conta.valorPago || conta.valor));
    });

    pagarFiltradas.forEach((conta) => {
      const mes = new Date(conta.vencimento).toISOString().slice(0, 7);
      const atual = despesasPorMes.get(mes) || 0;
      despesasPorMes.set(mes, atual + (conta.valorPago || conta.valor));
    });

    const totalReceitas = receberFiltradas.reduce((acc, c) => acc + (c.valorPago || c.valor), 0);
    const totalDespesas = pagarFiltradas.reduce((acc, c) => acc + (c.valorPago || c.valor), 0);
    const saldo = totalReceitas - totalDespesas;
    const margem = totalReceitas > 0 ? (saldo / totalReceitas) * 100 : 0;

    return {
      periodo: { inicio: dataInicio.toISOString().split('T')[0], fim: new Date().toISOString().split('T')[0] },
      resumo: {
        totalReceitas,
        totalDespesas,
        saldo,
        margem,
        contasReceber: receberFiltradas.length,
        contasPagar: pagarFiltradas.length,
      },
      receber: receberStats,
      pagar: pagarStats,
      fluxoCaixa,
      receitasPorMes: Array.from(receitasPorMes.entries()).map(([mes, valor]) => ({ mes, valor })),
      despesasPorMes: Array.from(despesasPorMes.entries()).map(([mes, valor]) => ({ mes, valor })),
      contasVencidas: {
        receber: receberFiltradas.filter((c) => c.status === 'vencida').length,
        pagar: pagarFiltradas.filter((c) => c.status === 'atrasada').length,
      },
    };
  }

  async obterRelatorioKPIs(empresaId: string, filtros?: { periodo?: string }) {
    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;

    const [
      vendasStats,
      pipeline,
      receberStats,
      pagarStats,
      fluxoCaixa,
      estoqueStats,
      contratosStats,
    ] = await Promise.all([
      this.pedidosService.obterEstatisticas(empresaId),
      this.pedidosService.obterPipelineSnapshot(empresaId),
      this.financeiroService.obterEstatisticas(empresaId),
      this.financeiroService.obterEstatisticasPagar(empresaId),
      this.financeiroService.obterFluxoCaixa(empresaId, dias),
      this.estoqueService.obterEstatisticas(empresaId),
      this.contratosService.obterEstatisticas(empresaId),
    ]);

    const receitaLiquida = receberStats.totalRecebido - pagarStats.totalPago;
    const margemBruta = vendasStats.totalVendas > 0 ? ((vendasStats.totalVendas - vendasStats.totalComissoes) / vendasStats.totalVendas) * 100 : 0;
    const taxaConversao = pipeline.resumo.totalOportunidades > 0 ? (vendasStats.pedidosConcluidos / pipeline.resumo.totalOportunidades) * 100 : 0;
    const rotatividadeEstoque = 0; // valorTotal não está disponível em estoqueStats

    return {
      periodo: { dias },
      vendas: {
        ticketMedio: pipeline.resumo.ticketMedio,
        taxaConversao,
        chanceMedia: pipeline.resumo.chanceMedia * 100,
        totalOportunidades: pipeline.resumo.totalOportunidades,
        valorFunil: pipeline.resumo.valorTotal,
      },
      financeiro: {
        receitaLiquida,
        margemBruta,
        saldoDisponivel: fluxoCaixa.resumo.saldo,
        diasMedioRecebimento: receberStats.totalEmAberto > 0 ? 30 : 0,
        diasMedioPagamento: pagarStats.totalAberto > 0 ? 30 : 0,
      },
      estoque: {
        rotatividade: rotatividadeEstoque,
        valorTotal: 0, // não disponível em estoqueStats
        produtosCriticos: estoqueStats.produtosEstoqueBaixo?.length || 0,
        produtosSemEstoque: estoqueStats.produtosEstoqueBaixo?.filter((p: any) => p.estoque === 0).length || 0,
      },
      compras: {
        contratosVigentes: contratosStats.vigentes || 0,
        valorContratos: contratosStats.valorTotal || 0,
      },
      metas: {
        vendas: {
          realizado: vendasStats.totalVendas,
          meta: vendasStats.totalVendas * 1.2,
          percentual: 83.3,
        },
        receita: {
          realizado: receitaLiquida,
          meta: receitaLiquida * 1.15,
          percentual: 87.0,
        },
      },
    };
  }

  async obterRelatorioCompras(empresaId: string, filtros?: { periodo?: string }) {
    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    const [fornecedores, contratos, contratosStats] = await Promise.all([
      this.fornecedoresService.listar(empresaId),
      this.contratosService.listar(empresaId),
      this.contratosService.obterEstatisticas(empresaId),
    ]);

    const contratosFiltrados = contratos.filter((c) => {
      const data = new Date(c.dataInicio || '');
      return data >= dataInicio;
    });

    const comprasPorFornecedor = new Map<string, { fornecedor: any; quantidade: number; valorTotal: number }>();
    const comprasPorMes = new Map<string, number>();

    contratosFiltrados.forEach((contrato) => {
      const fornecedorKey = contrato.fornecedor || 'sem-fornecedor';
      const atual = comprasPorFornecedor.get(fornecedorKey) || {
        fornecedor: fornecedores.find((f) => f.nome === contrato.fornecedor),
        quantidade: 0,
        valorTotal: 0,
      };
      atual.quantidade += 1;
      atual.valorTotal += contrato.valor || 0;
      comprasPorFornecedor.set(fornecedorKey, atual);

      const mes = new Date(contrato.dataInicio || '').toISOString().slice(0, 7);
      const valorAtual = comprasPorMes.get(mes) || 0;
      comprasPorMes.set(mes, valorAtual + (contrato.valor || 0));
    });

    const totalCompras = contratosFiltrados.reduce((acc, c) => acc + (c.valor || 0), 0);
    const fornecedoresAtivos = comprasPorFornecedor.size;

    return {
      periodo: { inicio: dataInicio.toISOString().split('T')[0], fim: new Date().toISOString().split('T')[0] },
      resumo: {
        totalCompras,
        quantidadeContratos: contratosFiltrados.length,
        fornecedoresAtivos,
        ticketMedio: contratosFiltrados.length > 0 ? totalCompras / contratosFiltrados.length : 0,
      },
      contratos: contratosStats,
      comprasPorFornecedor: Array.from(comprasPorFornecedor.values())
        .sort((a, b) => b.valorTotal - a.valorTotal)
        .slice(0, 10)
        .map((c) => ({
          fornecedor: c.fornecedor?.nome || 'N/A',
          quantidade: c.quantidade,
          valorTotal: c.valorTotal,
        })),
      comprasPorMes: Array.from(comprasPorMes.entries()).map(([mes, valor]) => ({ mes, valor })),
      topFornecedores: Array.from(comprasPorFornecedor.values())
        .sort((a, b) => b.valorTotal - a.valorTotal)
        .slice(0, 5)
        .map((c) => ({
          nome: c.fornecedor?.nome || 'N/A',
          valorTotal: c.valorTotal,
          quantidade: c.quantidade,
        })),
    };
  }

  async obterRelatorioEstoque(empresaId: string, filtros?: { depositoId?: string }) {
    const estoqueStats = await this.estoqueService.obterEstatisticas(empresaId);
    const depositos = await this.estoqueService.listarDepositos(empresaId);
    const movimentacoes = await this.estoqueService.listarMovimentacoes(empresaId, {
      tipo: undefined, // depositoId não é suportado diretamente, precisa filtrar depois
    });

    const movimentacoesPorTipo = new Map<string, number>();
    const movimentacoesPorMes = new Map<string, { entradas: number; saidas: number }>();

    const movimentacoesFiltradas = filtros?.depositoId
      ? movimentacoes.filter(
          (mov) =>
            (mov.depositoOrigem?.id === filtros.depositoId) ||
            (mov.depositoDestino?.id === filtros.depositoId),
        )
      : movimentacoes;

    movimentacoesFiltradas.forEach((mov) => {
      const tipoAtual = movimentacoesPorTipo.get(mov.tipo) || 0;
      movimentacoesPorTipo.set(mov.tipo, tipoAtual + mov.quantidade);

      const mes = new Date(mov.criadoEm).toISOString().slice(0, 7);
      const mesAtual = movimentacoesPorMes.get(mes) || { entradas: 0, saidas: 0 };
      if (mov.tipo === 'entrada') {
        mesAtual.entradas += mov.quantidade;
      } else if (mov.tipo === 'saida' || mov.tipo === 'transferencia' || mov.tipo === 'ajuste') {
        mesAtual.saidas += mov.quantidade;
      }
      movimentacoesPorMes.set(mes, mesAtual);
    });

    return {
      resumo: estoqueStats,
      depositos: depositos.map((d) => ({
        id: d.id,
        nome: d.nome,
        tipo: d.tipo,
        status: d.status,
      })),
      movimentacoesPorTipo: Array.from(movimentacoesPorTipo.entries()).map(([tipo, quantidade]) => ({
        tipo,
        quantidade,
      })),
      movimentacoesPorMes: Array.from(movimentacoesPorMes.entries()).map(([mes, dados]) => ({
        mes,
        ...dados,
      })),
      produtosCriticos: estoqueStats.produtosEstoqueBaixo?.length || 0,
      produtosSemEstoque: estoqueStats.produtosEstoqueBaixo?.filter((p: any) => p.estoque === 0).length || 0,
      valorTotal: 0, // não disponível em estoqueStats
    };
  }

  async exportarRelatorio(
    empresaId: string,
    tipo: string,
    formato: 'csv' | 'json',
    filtros?: { periodo?: string; vendedorId?: string; depositoId?: string },
  ): Promise<string | any> {
    let dados: any;

    switch (tipo) {
      case 'vendas':
        dados = await this.obterRelatorioVendas(empresaId, {
          periodo: filtros?.periodo,
          vendedorId: filtros?.vendedorId,
        });
        break;
      case 'clientes':
        dados = await this.obterRelatorioClientes(empresaId, { periodo: filtros?.periodo });
        break;
      case 'financeiro':
        dados = await this.obterRelatorioFinanceiro(empresaId, { periodo: filtros?.periodo });
        break;
      case 'kpis':
        dados = await this.obterRelatorioKPIs(empresaId, { periodo: filtros?.periodo });
        break;
      case 'compras':
        dados = await this.obterRelatorioCompras(empresaId, { periodo: filtros?.periodo });
        break;
      case 'estoque':
        dados = await this.obterRelatorioEstoque(empresaId, { depositoId: filtros?.depositoId });
        break;
      default:
        throw new Error(`Tipo de relatório não suportado: ${tipo}`);
    }

    if (formato === 'json') {
      return dados;
    }

    return this.gerarCSV(dados, tipo);
  }

  async obterRelatorioPerformanceVendedores(empresaId: string, filtros?: { periodo?: string }) {
    const pedidos = await this.pedidosService.listarPedidos(empresaId);
    const usuarios = await this.usuarioRepo.find({ where: { ativo: true } });

    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    const pedidosFiltrados = pedidos.filter((p) => {
      const dataPedido = new Date(p.dataPedido || (p as any).createdAt || '');
      return dataPedido >= dataInicio && p.vendedorId;
    });

    const performancePorVendedor = new Map<number, {
      vendedor: any;
      totalVendas: number;
      quantidadePedidos: number;
      ticketMedio: number;
      pedidosConcluidos: number;
      taxaConversao: number;
      totalComissao: number;
    }>();

    pedidosFiltrados.forEach((pedido) => {
      const vendedorId = pedido.vendedorId!;
      const vendedor = usuarios.find((u) => u.id === vendedorId);
      
      if (!performancePorVendedor.has(vendedorId)) {
        performancePorVendedor.set(vendedorId, {
          vendedor: vendedor ? { id: vendedor.id, nome: vendedor.name } : null,
          totalVendas: 0,
          quantidadePedidos: 0,
          ticketMedio: 0,
          pedidosConcluidos: 0,
          taxaConversao: 0,
          totalComissao: 0,
        });
      }

      const perf = performancePorVendedor.get(vendedorId)!;
      perf.totalVendas += pedido.total || 0;
      perf.quantidadePedidos += 1;
      if (pedido.status === 'entregue' || pedido.status === 'concluido') {
        perf.pedidosConcluidos += 1;
      }
    });

    performancePorVendedor.forEach((perf) => {
      perf.ticketMedio = perf.quantidadePedidos > 0 ? perf.totalVendas / perf.quantidadePedidos : 0;
      perf.taxaConversao = perf.quantidadePedidos > 0 ? (perf.pedidosConcluidos / perf.quantidadePedidos) * 100 : 0;
    });

    const ranking = Array.from(performancePorVendedor.values())
      .sort((a, b) => b.totalVendas - a.totalVendas)
      .map((perf, index) => ({ ...perf, posicao: index + 1 }));

    return {
      periodo: { inicio: dataInicio.toISOString().split('T')[0], fim: new Date().toISOString().split('T')[0] },
      resumo: {
        totalVendedores: ranking.length,
        totalVendas: ranking.reduce((acc, r) => acc + r.totalVendas, 0),
        totalPedidos: ranking.reduce((acc, r) => acc + r.quantidadePedidos, 0),
      },
      ranking,
    };
  }

  async obterRelatorioConversaoOrcamentos(empresaId: string, filtros?: { periodo?: string }) {
    const orcamentos = await this.orcamentosService.listarOrcamentos(empresaId);
    const pedidos = await this.pedidosService.listarPedidos(empresaId);

    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    const orcamentosFiltrados = orcamentos.filter((o) => {
      const data = new Date(o.createdAt || '');
      return data >= dataInicio;
    });

    const totalOrcamentos = orcamentosFiltrados.length;
    const orcamentosConvertidos = orcamentosFiltrados.filter((o) => o.status === 'aprovado' || o.status === 'convertido').length;
    const orcamentosPerdidos = orcamentosFiltrados.filter((o) => o.status === 'cancelado' || o.status === 'perdido').length;
    const orcamentosPendentes = orcamentosFiltrados.filter((o) => o.status === 'pendente' || o.status === 'enviado').length;

    const taxaConversao = totalOrcamentos > 0 ? (orcamentosConvertidos / totalOrcamentos) * 100 : 0;

    const orcamentosComTempo = orcamentosFiltrados
      .filter((o) => o.status === 'aprovado' || o.status === 'convertido')
      .map((o) => {
        const dataCriacao = new Date(o.createdAt || '');
        const dataAprovacao = new Date(o.updatedAt || '');
        const dias = Math.ceil((dataAprovacao.getTime() - dataCriacao.getTime()) / (1000 * 60 * 60 * 24));
        return dias;
      });

    const tempoMedioConversao = orcamentosComTempo.length > 0
      ? orcamentosComTempo.reduce((acc, d) => acc + d, 0) / orcamentosComTempo.length
      : 0;

    const valorTotalOrcamentos = orcamentosFiltrados.reduce((acc, o) => acc + (o.valorTotal || 0), 0);
    const valorOrcamentosConvertidos = orcamentosFiltrados
      .filter((o) => o.status === 'aprovado' || o.status === 'convertido')
      .reduce((acc, o) => acc + (o.valorTotal || 0), 0);

    const conversaoPorStatus = new Map<string, number>();
    orcamentosFiltrados.forEach((o) => {
      const atual = conversaoPorStatus.get(o.status) || 0;
      conversaoPorStatus.set(o.status, atual + 1);
    });

    return {
      periodo: { inicio: dataInicio.toISOString().split('T')[0], fim: new Date().toISOString().split('T')[0] },
      resumo: {
        totalOrcamentos,
        orcamentosConvertidos,
        orcamentosPerdidos,
        orcamentosPendentes,
        taxaConversao,
        tempoMedioConversao: Math.round(tempoMedioConversao),
        valorTotalOrcamentos,
        valorOrcamentosConvertidos,
      },
      conversaoPorStatus: Array.from(conversaoPorStatus.entries()).map(([status, quantidade]) => ({
        status,
        quantidade,
        percentual: totalOrcamentos > 0 ? (quantidade / totalOrcamentos) * 100 : 0,
      })),
    };
  }

  async obterRelatorioProdutosMaisVendidos(empresaId: string, filtros?: { periodo?: string; limite?: number }) {
    const pedidos = await this.pedidosService.listarPedidos(empresaId);
    const produtos = await this.produtosService.findAll(empresaId);

    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);
    const limite = filtros?.limite || 20;

    const pedidosFiltrados = pedidos.filter((p) => {
      const dataPedido = new Date(p.dataPedido || (p as any).createdAt || '');
      return dataPedido >= dataInicio;
    });

    const produtosVendidos = new Map<number, {
      produto: any;
      quantidadeVendida: number;
      valorTotal: number;
      quantidadePedidos: number;
      margemLucro: number;
    }>();

    pedidosFiltrados.forEach((pedido) => {
      if (!pedido.itens || pedido.itens.length === 0) return;

      pedido.itens.forEach((item: any) => {
        const produtoId = item.produtoId || item.produto?.id;
        if (!produtoId) return;

        const produto = produtos.find((p) => p.id === produtoId);
        if (!produto) return;

        if (!produtosVendidos.has(produtoId)) {
          produtosVendidos.set(produtoId, {
            produto: {
              id: produto.id,
              nome: produto.nome,
              categoria: produto.categoria,
              precoVenda: (produto as any).precoVenda || produto.preco || 0,
              precoCusto: (produto as any).precoCusto || 0,
            },
            quantidadeVendida: 0,
            valorTotal: 0,
            quantidadePedidos: 0,
            margemLucro: 0,
          });
        }

        const prod = produtosVendidos.get(produtoId)!;
        const quantidade = item.quantidade || 0;
        const precoUnitario = item.precoUnitario || (produto as any).precoVenda || produto.preco || 0;
        const subtotal = item.subtotal || (quantidade * precoUnitario);

        prod.quantidadeVendida += quantidade;
        prod.valorTotal += subtotal;
        prod.quantidadePedidos += 1;
      });
    });

    produtosVendidos.forEach((prod) => {
      const custoTotal = prod.produto.precoCusto * prod.quantidadeVendida;
      const lucro = prod.valorTotal - custoTotal;
      prod.margemLucro = prod.valorTotal > 0 ? (lucro / prod.valorTotal) * 100 : 0;
    });

    const ranking = Array.from(produtosVendidos.values())
      .sort((a, b) => b.quantidadeVendida - a.quantidadeVendida)
      .slice(0, limite)
      .map((prod, index) => ({ ...prod, posicao: index + 1 }));

    return {
      periodo: { inicio: dataInicio.toISOString().split('T')[0], fim: new Date().toISOString().split('T')[0] },
      resumo: {
        totalProdutos: produtosVendidos.size,
        totalVendido: ranking.reduce((acc, r) => acc + r.valorTotal, 0),
        totalQuantidade: ranking.reduce((acc, r) => acc + r.quantidadeVendida, 0),
      },
      ranking,
    };
  }

  async obterRelatorioClientesInativos(empresaId: string, filtros?: { diasInatividade?: number }) {
    const clientes = await this.clientesService.findAll(empresaId);
    const pedidos = await this.pedidosService.listarPedidos(empresaId);

    const diasInatividade = filtros?.diasInatividade || 90;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasInatividade);

    const clientesComUltimaCompra = clientes.map((cliente) => {
      const pedidosCliente = pedidos.filter((p) => p.clienteId === cliente.id);
      const ultimaCompra = pedidosCliente.length > 0
        ? pedidosCliente.reduce((maisRecente, p) => {
            const dataPedido = new Date(p.dataPedido || (p as any).createdAt || '');
            return dataPedido > maisRecente ? dataPedido : maisRecente;
          }, new Date(0))
        : null;

      const diasSemCompra = ultimaCompra
        ? Math.ceil((new Date().getTime() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const totalVendas = pedidosCliente.reduce((acc, p) => acc + (p.total || 0), 0);

      return {
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
        },
        ultimaCompra: ultimaCompra?.toISOString().split('T')[0] || null,
        diasSemCompra,
        totalVendas,
        quantidadePedidos: pedidosCliente.length,
        potencialReativacao: diasSemCompra && diasSemCompra > diasInatividade ? 'alto' : diasSemCompra && diasSemCompra > diasInatividade / 2 ? 'medio' : 'baixo',
      };
    });

    const clientesInativos = clientesComUltimaCompra
      .filter((c) => !c.ultimaCompra || c.diasSemCompra! > diasInatividade)
      .sort((a, b) => (b.diasSemCompra || 0) - (a.diasSemCompra || 0));

    return {
      diasInatividade,
      resumo: {
        totalClientes: clientes.length,
        clientesInativos: clientesInativos.length,
        clientesAtivos: clientes.length - clientesInativos.length,
        percentualInativos: clientes.length > 0 ? (clientesInativos.length / clientes.length) * 100 : 0,
      },
      clientesInativos,
    };
  }

  async obterRelatorioMargemLucro(empresaId: string, filtros?: { periodo?: string; agrupamento?: 'produto' | 'categoria' | 'vendedor' }) {
    const pedidos = await this.pedidosService.listarPedidos(empresaId);
    const produtos = await this.produtosService.findAll(empresaId);
    const usuarios = await this.usuarioRepo.find({ where: { ativo: true } });

    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);
    const agrupamento = filtros?.agrupamento || 'produto';

    const pedidosFiltrados = pedidos.filter((p) => {
      const dataPedido = new Date(p.dataPedido || (p as any).createdAt || '');
      return dataPedido >= dataInicio;
    });

    const margens = new Map<string, {
      chave: string;
      nome: string;
      receita: number;
      custo: number;
      lucro: number;
      margem: number;
      quantidade: number;
    }>();

    pedidosFiltrados.forEach((pedido) => {
      if (!pedido.itens || pedido.itens.length === 0) return;

      pedido.itens.forEach((item: any) => {
        const produtoId = item.produtoId || item.produto?.id;
        if (!produtoId) return;

        const produto = produtos.find((p) => p.id === produtoId);
        if (!produto) return;

        const quantidade = item.quantidade || 0;
        const precoVenda = item.precoUnitario || produto.preco || 0;
        const precoCusto = produto.precoCusto || 0;
        const receita = quantidade * precoVenda;
        const custo = quantidade * precoCusto;
        const lucro = receita - custo;
        const margem = receita > 0 ? (lucro / receita) * 100 : 0;

        let chave: string;
        let nome: string;

        if (agrupamento === 'produto') {
          chave = `produto-${produtoId}`;
          nome = produto.nome;
        } else if (agrupamento === 'categoria') {
          chave = `categoria-${produto.categoria || 'sem-categoria'}`;
          nome = produto.categoria || 'Sem categoria';
        } else {
          chave = `vendedor-${pedido.vendedorId || 'sem-vendedor'}`;
          const vendedor = usuarios.find((u) => u.id === pedido.vendedorId);
          nome = vendedor?.name || 'Sem vendedor';
        }

        if (!margens.has(chave)) {
          margens.set(chave, {
            chave,
            nome,
            receita: 0,
            custo: 0,
            lucro: 0,
            margem: 0,
            quantidade: 0,
          });
        }

        const margemAtual = margens.get(chave)!;
        margemAtual.receita += receita;
        margemAtual.custo += custo;
        margemAtual.lucro += lucro;
        margemAtual.quantidade += quantidade;
      });
    });

    margens.forEach((m) => {
      m.margem = m.receita > 0 ? (m.lucro / m.receita) * 100 : 0;
    });

    const ranking = Array.from(margens.values())
      .sort((a, b) => b.margem - a.margem);

    const receitaTotal = ranking.reduce((acc, r) => acc + r.receita, 0);
    const custoTotal = ranking.reduce((acc, r) => acc + r.custo, 0);
    const lucroTotal = ranking.reduce((acc, r) => acc + r.lucro, 0);
    const margemMedia = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;

    return {
      periodo: { inicio: dataInicio.toISOString().split('T')[0], fim: new Date().toISOString().split('T')[0] },
      agrupamento,
      resumo: {
        receitaTotal,
        custoTotal,
        lucroTotal,
        margemMedia,
      },
      ranking,
    };
  }

  async obterRelatorioInadimplencia(empresaId: string, filtros?: { diasAtraso?: number }) {
    const contasReceber = await this.financeiroService.listarContasReceber(empresaId);
    const diasAtraso = filtros?.diasAtraso || 30;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const contasAtrasadas = contasReceber
      .filter((conta) => {
        if (!conta.vencimento) return false;
        const vencimento = new Date(conta.vencimento);
        vencimento.setHours(0, 0, 0, 0);
        return vencimento < hoje && conta.status !== 'recebida' && conta.status !== 'negociada';
      })
      .map((conta) => {
        const vencimento = new Date(conta.vencimento!);
        const dias = Math.ceil((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...conta,
          diasAtraso: dias,
          risco: dias > 90 ? 'alto' : dias > 60 ? 'medio' : 'baixo',
        };
      })
      .filter((c) => c.diasAtraso >= diasAtraso)
      .sort((a, b) => b.diasAtraso - a.diasAtraso);

    const valorTotalAtrasado = contasAtrasadas.reduce((acc, c) => acc + (c.valor || 0), 0);
    const valorTotalReceber = contasReceber
      .filter((c) => c.status !== 'recebida' && c.status !== 'negociada')
      .reduce((acc, c) => acc + (c.valor || 0), 0);

    const inadimplenciaPorFaixa = {
      '0-30': contasAtrasadas.filter((c) => c.diasAtraso <= 30).reduce((acc, c) => acc + (c.valor || 0), 0),
      '31-60': contasAtrasadas.filter((c) => c.diasAtraso > 30 && c.diasAtraso <= 60).reduce((acc, c) => acc + (c.valor || 0), 0),
      '61-90': contasAtrasadas.filter((c) => c.diasAtraso > 60 && c.diasAtraso <= 90).reduce((acc, c) => acc + (c.valor || 0), 0),
      '90+': contasAtrasadas.filter((c) => c.diasAtraso > 90).reduce((acc, c) => acc + (c.valor || 0), 0),
    };

    return {
      diasAtraso,
      resumo: {
        totalContasAtrasadas: contasAtrasadas.length,
        valorTotalAtrasado,
        valorTotalReceber,
        percentualInadimplencia: valorTotalReceber > 0 ? (valorTotalAtrasado / valorTotalReceber) * 100 : 0,
      },
      inadimplenciaPorFaixa,
      contasAtrasadas: contasAtrasadas.slice(0, 50),
    };
  }

  async obterRelatorioMetasVsRealizado(empresaId: string, filtros?: { periodo?: string }) {
    const pedidos = await this.pedidosService.listarPedidos(empresaId);
    const usuarios = await this.usuarioRepo.find({ where: { ativo: true } });

    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    const pedidosFiltrados = pedidos.filter((p) => {
      const dataPedido = new Date(p.dataPedido || (p as any).createdAt || '');
      return dataPedido >= dataInicio && p.vendedorId;
    });

    const realizadoPorVendedor = new Map<number, { vendedor: any; realizado: number; quantidade: number }>();

    pedidosFiltrados.forEach((pedido) => {
      const vendedorId = pedido.vendedorId!;
      if (!realizadoPorVendedor.has(vendedorId)) {
        const vendedor = usuarios.find((u) => u.id === vendedorId);
        realizadoPorVendedor.set(vendedorId, {
          vendedor: vendedor ? { id: vendedor.id, nome: vendedor.name } : null,
          realizado: 0,
          quantidade: 0,
        });
      }
      const atual = realizadoPorVendedor.get(vendedorId)!;
      atual.realizado += pedido.total || 0;
      atual.quantidade += 1;
    });

    const comparativo = Array.from(realizadoPorVendedor.values()).map((item) => ({
      ...item,
      meta: 0,
      percentualAtingido: 0,
      diferenca: item.realizado,
    }));

    return {
      periodo: { inicio: dataInicio.toISOString().split('T')[0], fim: new Date().toISOString().split('T')[0] },
      resumo: {
        totalVendedores: comparativo.length,
        totalRealizado: comparativo.reduce((acc, c) => acc + c.realizado, 0),
        totalMeta: comparativo.reduce((acc, c) => acc + c.meta, 0),
      },
      comparativo,
    };
  }

  async obterRelatorioVendasPorRegiao(empresaId: string, filtros?: { periodo?: string }) {
    const pedidos = await this.pedidosService.listarPedidos(empresaId);
    const clientes = await this.clientesService.findAll(empresaId);

    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    const pedidosFiltrados = pedidos.filter((p) => {
      const dataPedido = new Date(p.dataPedido || (p as any).createdAt || '');
      return dataPedido >= dataInicio;
    });

    const vendasPorRegiao = new Map<string, { regiao: string; cidade?: string; valor: number; quantidade: number }>();

    pedidosFiltrados.forEach((pedido) => {
      const cliente = clientes.find((c) => c.id === pedido.clienteId);
      if (!cliente) return;

      const cidade = (cliente as any).cidade || (cliente as any).endereco?.split(',')[0] || 'Não informado';
      const estado = (cliente as any).estado || (cliente as any).endereco?.split(',')[1]?.trim() || 'Não informado';
      const regiao = estado;

      const chave = `${regiao}-${cidade}`;
      if (!vendasPorRegiao.has(chave)) {
        vendasPorRegiao.set(chave, {
          regiao,
          cidade,
          valor: 0,
          quantidade: 0,
        });
      }

      const atual = vendasPorRegiao.get(chave)!;
      atual.valor += pedido.total || 0;
      atual.quantidade += 1;
    });

    const ranking = Array.from(vendasPorRegiao.values())
      .sort((a, b) => b.valor - a.valor);

    return {
      periodo: { inicio: dataInicio.toISOString().split('T')[0], fim: new Date().toISOString().split('T')[0] },
      resumo: {
        totalRegioes: new Set(ranking.map((r) => r.regiao)).size,
        totalCidades: ranking.length,
        valorTotal: ranking.reduce((acc, r) => acc + r.valor, 0),
      },
      ranking,
    };
  }

  async obterRelatorioEstoqueCritico(empresaId: string) {
    const produtos = await this.produtosService.findAll(empresaId);
    const movimentacoes = await this.estoqueService.listarMovimentacoes(empresaId);

    const produtosCriticos = produtos
      .filter((p) => p.estoque <= p.estoqueMinimo)
      .map((p) => ({
        produto: {
          id: p.id,
          nome: p.nome,
          categoria: p.categoria,
        },
        estoqueAtual: p.estoque,
        estoqueMinimo: p.estoqueMinimo,
        diferenca: p.estoque - p.estoqueMinimo,
        status: p.estoque === 0 ? 'zerado' : p.estoque < p.estoqueMinimo * 0.5 ? 'critico' : 'baixo',
      }))
      .sort((a, b) => a.diferenca - b.diferenca);

    const noventaDiasAtras = new Date();
    noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90);

    const produtosParados = produtos
      .filter((p) => {
        const movimentacoesProduto = movimentacoes.filter((m) => (m as any).produtoId === p.id);
        if (movimentacoesProduto.length === 0) return true;
        const ultimaMovimentacao = movimentacoesProduto.reduce((maisRecente, m) => {
          const data = new Date(m.criadoEm);
          return data > maisRecente ? data : maisRecente;
        }, new Date(0));
        return ultimaMovimentacao < noventaDiasAtras;
      })
      .map((p) => ({
        produto: {
          id: p.id,
          nome: p.nome,
          categoria: p.categoria,
        },
        estoqueAtual: p.estoque,
        ultimaMovimentacao: null,
      }));

    return {
      resumo: {
        produtosCriticos: produtosCriticos.length,
        produtosZerados: produtosCriticos.filter((p) => p.status === 'zerado').length,
        produtosParados: produtosParados.length,
      },
      produtosCriticos,
      produtosParados: produtosParados.slice(0, 50),
    };
  }

  async obterRelatorioFornecedores(empresaId: string, filtros?: { periodo?: string }) {
    const fornecedores = await this.fornecedoresService.listar(empresaId);
    const contratos = await this.contratosService.listar(empresaId);

    const periodo = filtros?.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    const contratosFiltrados = contratos.filter((c) => {
      const data = new Date(c.dataInicio || '');
      return data >= dataInicio;
    });

    const performancePorFornecedor = new Map<string, {
      fornecedor: any;
      quantidadeContratos: number;
      valorTotal: number;
      tempoMedioEntrega: number;
      avaliacaoMedia: number;
    }>();

    contratosFiltrados.forEach((contrato) => {
      const nomeFornecedor = contrato.fornecedor || 'sem-fornecedor';
      const fornecedor = fornecedores.find((f) => f.nome === nomeFornecedor);

      if (!performancePorFornecedor.has(nomeFornecedor)) {
        performancePorFornecedor.set(nomeFornecedor, {
          fornecedor: fornecedor || { nome: nomeFornecedor },
          quantidadeContratos: 0,
          valorTotal: 0,
          tempoMedioEntrega: 0,
          avaliacaoMedia: 0,
        });
      }

      const perf = performancePorFornecedor.get(nomeFornecedor)!;
      perf.quantidadeContratos += 1;
      perf.valorTotal += contrato.valor || 0;
    });

    const ranking = Array.from(performancePorFornecedor.values())
      .sort((a, b) => b.valorTotal - a.valorTotal);

    return {
      periodo: { inicio: dataInicio.toISOString().split('T')[0], fim: new Date().toISOString().split('T')[0] },
      resumo: {
        totalFornecedores: fornecedores.length,
        fornecedoresAtivos: ranking.length,
        valorTotal: ranking.reduce((acc, r) => acc + r.valorTotal, 0),
      },
      ranking,
    };
  }

  private gerarCSV(dados: any, tipo: string): string {
    const linhas: string[] = [];
    const escapeCSV = (valor: any): string => {
      if (valor === null || valor === undefined) return '';
      const str = String(valor);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    switch (tipo) {
      case 'vendas':
        linhas.push('Data,Valor,Status,Vendedor ID,Cliente');
        if (dados.vendasPorDia) {
          dados.vendasPorDia.forEach((item: any) => {
            linhas.push(`${escapeCSV(item.data)},${escapeCSV(item.valor)},,,`);
          });
        }
        if (dados.topPedidos) {
          linhas.push('\nTop Pedidos');
          linhas.push('Número,Cliente,Valor,Status,Data');
          dados.topPedidos.forEach((pedido: any) => {
            linhas.push(
              `${escapeCSV(pedido.numero)},${escapeCSV(pedido.cliente)},${escapeCSV(pedido.valor)},${escapeCSV(pedido.status)},${escapeCSV(pedido.data)}`,
            );
          });
        }
        break;

      case 'clientes':
        linhas.push('Nome,Email,Total Vendas,Quantidade Pedidos,Última Compra');
        if (dados.topClientes) {
          dados.topClientes.forEach((cliente: any) => {
            linhas.push(
              `${escapeCSV(cliente.nome)},${escapeCSV(cliente.email)},${escapeCSV(cliente.totalVendas)},${escapeCSV(cliente.quantidadePedidos)},${escapeCSV(cliente.ultimaCompra)}`,
            );
          });
        }
        break;

      case 'financeiro':
        linhas.push('Mês,Receitas,Despesas,Saldo');
        const meses = new Set<string>();
        if (dados.receitasPorMes) {
          dados.receitasPorMes.forEach((item: any) => meses.add(item.mes));
        }
        if (dados.despesasPorMes) {
          dados.despesasPorMes.forEach((item: any) => meses.add(item.mes));
        }
        Array.from(meses)
          .sort()
          .forEach((mes) => {
            const receita = dados.receitasPorMes?.find((r: any) => r.mes === mes)?.valor || 0;
            const despesa = dados.despesasPorMes?.find((d: any) => d.mes === mes)?.valor || 0;
            linhas.push(`${escapeCSV(mes)},${escapeCSV(receita)},${escapeCSV(despesa)},${escapeCSV(receita - despesa)}`);
          });
        break;

      case 'kpis':
        linhas.push('Categoria,Indicador,Valor');
        if (dados.vendas) {
          linhas.push(`Vendas,Ticket Médio,${escapeCSV(dados.vendas.ticketMedio)}`);
          linhas.push(`Vendas,Taxa de Conversão,${escapeCSV(dados.vendas.taxaConversao)}%`);
          linhas.push(`Vendas,Chance Média,${escapeCSV(dados.vendas.chanceMedia)}%`);
        }
        if (dados.financeiro) {
          linhas.push(`Financeiro,Receita Líquida,${escapeCSV(dados.financeiro.receitaLiquida)}`);
          linhas.push(`Financeiro,Margem Bruta,${escapeCSV(dados.financeiro.margemBruta)}%`);
        }
        if (dados.estoque) {
          linhas.push(`Estoque,Rotatividade,${escapeCSV(dados.estoque.rotatividade)}`);
          linhas.push(`Estoque,Valor Total,${escapeCSV(dados.estoque.valorTotal)}`);
        }
        break;

      case 'compras':
        linhas.push('Fornecedor,Quantidade Contratos,Valor Total');
        if (dados.comprasPorFornecedor) {
          dados.comprasPorFornecedor.forEach((item: any) => {
            linhas.push(`${escapeCSV(item.fornecedor)},${escapeCSV(item.quantidade)},${escapeCSV(item.valorTotal)}`);
          });
        }
        break;

      case 'estoque':
        linhas.push('Tipo Movimentação,Quantidade');
        if (dados.movimentacoesPorTipo) {
          dados.movimentacoesPorTipo.forEach((item: any) => {
            linhas.push(`${escapeCSV(item.tipo)},${escapeCSV(item.quantidade)}`);
          });
        }
        linhas.push('\nMovimentações por Mês');
        linhas.push('Mês,Entradas,Saídas');
        if (dados.movimentacoesPorMes) {
          dados.movimentacoesPorMes.forEach((item: any) => {
            linhas.push(`${escapeCSV(item.mes)},${escapeCSV(item.entradas)},${escapeCSV(item.saidas)}`);
          });
        }
        break;
    }

    return '\ufeff' + linhas.join('\n');
  }
}

function vendasComPipeline(
  estatisticas: Awaited<ReturnType<PedidosService['obterEstatisticas']>>,
  resumoPipeline: Awaited<ReturnType<PedidosService['obterPipelineSnapshot']>>['resumo'],
) {
  return {
    ...estatisticas,
    ticketMedio: resumoPipeline.ticketMedio,
    chanceMedia: resumoPipeline.chanceMedia,
    totalOportunidades: resumoPipeline.totalOportunidades,
    valorFunil: resumoPipeline.valorTotal,
  };
}


