import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContaReceber, ContaReceberStats, StatusReceber } from './conta-receber.interface';
import { CreateContaReceberDto } from './dto/create-conta-receber.dto';
import { ContaPagar, ContaPagarStats, StatusPagar } from './conta-pagar.interface';
import { CreateContaPagarDto } from './dto/create-conta-pagar.dto';
import { ContaBancaria } from './conta-bancaria.interface';
import { InvestimentoCarteira } from './investimento-carteira.entity';
import { InvestimentoAtivo } from './investimento-ativo.entity';
import { InvestimentoHistorico } from './investimento-historico.entity';
import { InvestimentoAlerta } from './investimento-alerta.entity';
import { OrcamentoCentroCustoEntity } from './orcamento-centro.entity';
import { OrcamentoMetaMensal } from './orcamento-meta.entity';
import { OrcamentoAlertaEntity } from './orcamento-alerta.entity';
import { InvestimentoClasse, InvestimentoResponse } from './investimento.interface';
import {
  OrcamentoAlerta,
  OrcamentoLinhaCentroCusto,
  OrcamentoResponse,
} from './orcamento.interface';
import { CreateInvestimentoCarteiraDto } from './dto/create-investimento-carteira.dto';
import { UpdateInvestimentoCarteiraDto } from './dto/update-investimento-carteira.dto';
import { CreateInvestimentoAtivoDto } from './dto/create-investimento-ativo.dto';
import { UpdateInvestimentoAtivoDto } from './dto/update-investimento-ativo.dto';
import { CreateInvestimentoHistoricoDto } from './dto/create-investimento-historico.dto';
import { CreateInvestimentoAlertaDto } from './dto/create-investimento-alerta.dto';
import { CreateOrcamentoCentroDto } from './dto/create-orcamento-centro.dto';
import { UpdateOrcamentoCentroDto } from './dto/update-orcamento-centro.dto';
import { CreateOrcamentoMetaDto } from './dto/create-orcamento-meta.dto';
import { UpdateOrcamentoMetaDto } from './dto/update-orcamento-meta.dto';
import { CreateOrcamentoAlertaDto } from './dto/create-orcamento-alerta.dto';

@Injectable()
export class FinanceiroService {
  // Arrays em memória - dados hardcoded removidos
  private contas: ContaReceber[] = [];

  // Arrays em memória - dados hardcoded removidos
  private contasPagar: ContaPagar[] = [];

  // Arrays em memória - dados hardcoded removidos
  private contasBancarias: ContaBancaria[] = [];

  constructor(
    @InjectRepository(InvestimentoCarteira)
    private readonly carteirasRepository: Repository<InvestimentoCarteira>,
    @InjectRepository(InvestimentoAtivo)
    private readonly ativosRepository: Repository<InvestimentoAtivo>,
    @InjectRepository(InvestimentoHistorico)
    private readonly historicoRepository: Repository<InvestimentoHistorico>,
    @InjectRepository(InvestimentoAlerta)
    private readonly alertasRepository: Repository<InvestimentoAlerta>,
    @InjectRepository(OrcamentoCentroCustoEntity)
    private readonly orcamentoCentroRepository: Repository<OrcamentoCentroCustoEntity>,
    @InjectRepository(OrcamentoMetaMensal)
    private readonly orcamentoMetaRepository: Repository<OrcamentoMetaMensal>,
    @InjectRepository(OrcamentoAlertaEntity)
    private readonly orcamentoAlertasRepository: Repository<OrcamentoAlertaEntity>,
  ) {}

  // Seed removido - não criar dados automaticamente
  // async onModuleInit() {
  //   // Seed removido para evitar dados hardcoded
  // }

  // Método seed removido - não criar dados automaticamente
  /*
  private async seedInvestimentos() {
    // Seed removido para evitar dados hardcoded
  }
  */

  // Método seed desabilitado - não criar dados automaticamente
  private async seedInvestimentos() {
    // Seed desabilitado - não criar dados automaticamente
    return;
    /* COMENTADO - Seed removido para evitar dados hardcoded
    const totalCarteiras = await this.carteirasRepository.count();
    if (totalCarteiras > 0) {
      return;
    }

    const carteiras = await this.carteirasRepository.save(
      this.carteirasRepository.create([
        {
          nome: 'Reserva de Caixa',
          objetivo: 'Garantir liquidez para 3 meses de operação',
          saldoAplicado: 25000,
          saldoAtual: 25750,
          rentabilidadeMensal: 0.6,
          rentabilidade12m: 7.2,
          risco: 'baixo',
          empresaId: 'default-empresa',
        },
        {
          nome: 'Expansão Comercial',
          objetivo: 'Apoiar projetos estratégicos da área comercial',
          saldoAplicado: 48000,
          saldoAtual: 51200,
          rentabilidadeMensal: 1.4,
          rentabilidade12m: 10.8,
          risco: 'medio',
          empresaId: 'default-empresa',
        },
        {
          nome: 'Reserva Regional',
          objetivo: 'Suporte a oportunidades na regional Sul',
          saldoAplicado: 18000,
          saldoAtual: 18180,
          rentabilidadeMensal: 0.4,
          rentabilidade12m: 5.5,
          risco: 'baixo',
          empresaId: 'empresa-sul',
        },
      ]),
    );

    const carteiraPorNome = new Map(carteiras.map((carteira) => [carteira.nome, carteira]));

    await this.ativosRepository.save(
      this.ativosRepository.create([
        {
          carteiraId: carteiraPorNome.get('Reserva de Caixa')?.id,
          ativo: 'CDB Liquidez Diária',
          classe: 'renda_fixa',
          instituicao: 'Banco do Brasil',
          valorAplicado: 15000,
          valorAtual: 15420,
          rentabilidade12m: 6.8,
          risco: 'baixo',
          empresaId: 'default-empresa',
          aplicadoEm: '2023-09-01',
          atualizadoEmData: new Date('2024-03-04T09:00:00Z'),
        },
        {
          carteiraId: carteiraPorNome.get('Reserva de Caixa')?.id,
          ativo: 'Tesouro Selic 2026',
          classe: 'renda_fixa',
          instituicao: 'Tesouro Direto',
          valorAplicado: 10000,
          valorAtual: 10330,
          rentabilidade12m: 7.5,
          risco: 'baixo',
          empresaId: 'default-empresa',
          aplicadoEm: '2023-07-15',
          atualizadoEmData: new Date('2024-03-04T09:00:00Z'),
        },
        {
          carteiraId: carteiraPorNome.get('Expansão Comercial')?.id,
          ativo: 'FII Logística BR',
          classe: 'fundo_imobiliario',
          instituicao: 'XP Investimentos',
          valorAplicado: 18000,
          valorAtual: 18840,
          rentabilidade12m: 9.1,
          risco: 'medio',
          empresaId: 'default-empresa',
          aplicadoEm: '2023-05-10',
          atualizadoEmData: new Date('2024-03-04T09:00:00Z'),
        },
        {
          carteiraId: carteiraPorNome.get('Expansão Comercial')?.id,
          ativo: 'ETF IVVB11',
          classe: 'internacional',
          instituicao: 'B3',
          valorAplicado: 30000,
          valorAtual: 32360,
          rentabilidade12m: 12.5,
          risco: 'alto',
          empresaId: 'default-empresa',
          aplicadoEm: '2023-02-20',
          atualizadoEmData: new Date('2024-03-04T09:00:00Z'),
        },
        {
          carteiraId: carteiraPorNome.get('Reserva Regional')?.id,
          ativo: 'LCI Agronegócio',
          classe: 'renda_fixa',
          instituicao: 'Itaú',
          valorAplicado: 12000,
          valorAtual: 12360,
          rentabilidade12m: 5.8,
          risco: 'baixo',
          empresaId: 'empresa-sul',
          aplicadoEm: '2023-08-01',
          atualizadoEmData: new Date('2024-03-02T12:00:00Z'),
        },
        {
          carteiraId: carteiraPorNome.get('Reserva Regional')?.id,
          ativo: 'Fundo Renda Regional',
          classe: 'renda_variavel',
          instituicao: 'BTG Pactual',
          valorAplicado: 6000,
          valorAtual: 5820,
          rentabilidade12m: -3.1,
          risco: 'medio',
          empresaId: 'empresa-sul',
          aplicadoEm: '2023-04-12',
          atualizadoEmData: new Date('2024-03-02T12:00:00Z'),
        },
      ]),
    );

    await this.historicoRepository.save(
      this.historicoRepository.create([
        { data: '2023-11-01', rentabilidade: 1.2, aporte: 10000, empresaId: 'default-empresa' },
        { data: '2023-12-01', rentabilidade: 0.9, empresaId: 'default-empresa' },
        { data: '2024-01-01', rentabilidade: 1.1, aporte: 8000, empresaId: 'default-empresa' },
        { data: '2024-02-01', rentabilidade: 0.8, empresaId: 'default-empresa' },
        { data: '2023-11-01', rentabilidade: 0.6, empresaId: 'empresa-sul' },
        { data: '2023-12-01', rentabilidade: 0.5, empresaId: 'empresa-sul' },
        { data: '2024-01-01', rentabilidade: 0.7, empresaId: 'empresa-sul' },
        { data: '2024-02-01', rentabilidade: 0.4, empresaId: 'empresa-sul' },
      ]),
    );

    await this.alertasRepository.save(
      this.alertasRepository.create([
        {
          empresaId: 'default-empresa',
          carteiraId: carteiraPorNome.get('Expansão Comercial')?.id,
          recomendacao: 'Rebalancear posição em renda variável reduzindo exposição em 5%.',
          impacto: 'medio',
        },
        {
          empresaId: 'default-empresa',
          carteiraId: carteiraPorNome.get('Reserva de Caixa')?.id,
          recomendacao: 'Avaliar migração de parte dos CDBs para Tesouro Selic devido à taxa atual.',
          impacto: 'baixo',
        },
        {
          empresaId: 'empresa-sul',
          carteiraId: carteiraPorNome.get('Reserva Regional')?.id,
          recomendacao: 'Realocar R$ 2.500 para produtos com garantia FGC para reduzir risco.',
          impacto: 'medio',
        },
      ]),
    );
    */ // FIM COMENTÁRIO seedInvestimentos
  }

  // Método seed desabilitado - não criar dados automaticamente
  private async seedOrcamento() {
    // Seed desabilitado - não criar dados automaticamente
    return;
    /* COMENTADO - Seed removido para evitar dados hardcoded
    const totalCentros = await this.orcamentoCentroRepository.count();
    if (totalCentros > 0) {
      return;
    }

    type CentroSeed = {
      empresaId: string;
      centroCusto: string;
      categoria: string;
      tipo: 'receita' | 'despesa';
      periodo: 'mensal' | 'trimestral' | 'anual';
      metaAnual: number;
      realizadoAnual: number;
      variacaoPercentual: number;
      metas: Array<{ mes: string; meta: number; realizado: number }>;
    };

    const centrosSeed: CentroSeed[] = [
      {
        empresaId: 'default-empresa',
        centroCusto: 'Vendas',
        categoria: 'Receitas Operacionais',
        tipo: 'receita',
        periodo: 'mensal',
        metaAnual: 650000,
        realizadoAnual: 158000,
        variacaoPercentual: -5.2,
        metas: [
          { mes: '2024-01', meta: 52000, realizado: 51000 },
          { mes: '2024-02', meta: 54000, realizado: 51000 },
          { mes: '2024-03', meta: 56000, realizado: 56000 },
        ],
      },
      {
        empresaId: 'default-empresa',
        centroCusto: 'Marketing',
        categoria: 'Investimentos em Marketing',
        tipo: 'despesa',
        periodo: 'mensal',
        metaAnual: 180000,
        realizadoAnual: 42000,
        variacaoPercentual: -4.5,
        metas: [
          { mes: '2024-01', meta: 14000, realizado: 13500 },
          { mes: '2024-02', meta: 15000, realizado: 14800 },
          { mes: '2024-03', meta: 16000, realizado: 13700 },
        ],
      },
      {
        empresaId: 'default-empresa',
        centroCusto: 'Operações',
        categoria: 'Custos Logísticos',
        tipo: 'despesa',
        periodo: 'mensal',
        metaAnual: 220000,
        realizadoAnual: 56200,
        variacaoPercentual: 3.1,
        metas: [
          { mes: '2024-01', meta: 18500, realizado: 19200 },
          { mes: '2024-02', meta: 18500, realizado: 18800 },
          { mes: '2024-03', meta: 18500, realizado: 18200 },
        ],
      },
      {
        empresaId: 'empresa-sul',
        centroCusto: 'Regional Sul - Receitas',
        categoria: 'Receitas Regionais',
        tipo: 'receita',
        periodo: 'mensal',
        metaAnual: 280000,
        realizadoAnual: 62000,
        variacaoPercentual: 4.2,
        metas: [
          { mes: '2024-01', meta: 21000, realizado: 22500 },
          { mes: '2024-02', meta: 21500, realizado: 21000 },
          { mes: '2024-03', meta: 22000, realizado: 18500 },
        ],
      },
      {
        empresaId: 'empresa-sul',
        centroCusto: 'Regional Sul - Custos',
        categoria: 'Custos Operacionais',
        tipo: 'despesa',
        periodo: 'mensal',
        metaAnual: 120000,
        realizadoAnual: 31500,
        variacaoPercentual: 6.8,
        metas: [
          { mes: '2024-01', meta: 9500, realizado: 10300 },
          { mes: '2024-02', meta: 9500, realizado: 9850 },
          { mes: '2024-03', meta: 9500, realizado: 10900 },
        ],
      },
    ];

    const centros = await this.orcamentoCentroRepository.save(
      this.orcamentoCentroRepository.create(
        centrosSeed.map(({ metas, ...rest }) => rest),
      ),
    );

    const centroKey = (empresaId: string, centroCusto: string) => `${empresaId}::${centroCusto}`;
    const centroMap = new Map<string, OrcamentoCentroCustoEntity>();
    centros.forEach((centro) => {
      centroMap.set(centroKey(centro.empresaId, centro.centroCusto), centro);
    });

    const metasSeed = centrosSeed.flatMap((seed) =>
      seed.metas.map((meta) => ({
        empresaId: seed.empresaId,
        centroId: centroMap.get(centroKey(seed.empresaId, seed.centroCusto))?.id,
        mes: meta.mes,
        meta: meta.meta,
        realizado: meta.realizado,
      })),
    );

    await this.orcamentoMetaRepository.save(
      this.orcamentoMetaRepository.create(metasSeed.filter((meta) => meta.centroId)),
    );

    await this.orcamentoAlertasRepository.save(
      this.orcamentoAlertasRepository.create([
        {
          empresaId: 'default-empresa',
          centroId: centroMap.get(centroKey('default-empresa', 'Operações'))?.id ?? null,
          centroCusto: 'Operações',
          categoria: 'Custos Logísticos',
          variacaoPercentual: 3.1,
          mensagem: 'Custos logísticos 3,1% acima da meta. Avaliar contratos de frete.',
          impacto: 'medio',
        },
        {
          empresaId: 'default-empresa',
          centroId: centroMap.get(centroKey('default-empresa', 'Marketing'))?.id ?? null,
          centroCusto: 'Marketing',
          categoria: 'Investimentos em Marketing',
          variacaoPercentual: -4.5,
          mensagem: 'Investimento abaixo do planejado pode afetar geração de leads.',
          impacto: 'baixo',
        },
        {
          empresaId: 'empresa-sul',
          centroId: centroMap.get(centroKey('empresa-sul', 'Regional Sul - Custos'))?.id ?? null,
          centroCusto: 'Regional Sul - Custos',
          categoria: 'Custos Operacionais',
          variacaoPercentual: 6.8,
          mensagem: 'Custos operacionais acima da meta. Revisar contratos locais.',
          impacto: 'alto',
        },
      ]),
    );
    */ // FIM COMENTÁRIO seedOrcamento
  }

  listarContasReceber(empresaId: string, filtros?: { status?: StatusReceber | 'todas'; search?: string }) {
    return this.contas.filter((conta) => {
      if (conta.empresaId !== empresaId) return false;
      const statusOk = !filtros?.status || filtros.status === 'todas' || conta.status === filtros.status;
      if (!statusOk) return false;
      if (filtros?.search) {
        const termo = filtros.search.toLowerCase();
        return (
          conta.titulo.toLowerCase().includes(termo) ||
          conta.cliente.toLowerCase().includes(termo) ||
          (conta.categoria?.toLowerCase().includes(termo) ?? false)
        );
      }
      return true;
    });
  }

  obterConta(empresaId: string, id: string): ContaReceber {
    const conta = this.contas.find((item) => item.empresaId === empresaId && item.id === id);
    if (!conta) {
      throw new NotFoundException('Conta a receber não encontrada');
    }
    return conta;
  }

  criarConta(dto: CreateContaReceberDto, empresaId: string): ContaReceber {
    const agora = new Date().toISOString();
    const status: StatusReceber = dto.status ?? 'aberta';
    const conta: ContaReceber = {
      id: randomUUID(),
      titulo: dto.titulo,
      cliente: dto.cliente,
      valor: dto.valor,
      valorPago: dto.valorPago ?? 0,
      emissao: dto.emissao,
      vencimento: dto.vencimento,
      pagamento: dto.pagamento,
      status,
      categoria: dto.categoria,
      formaPagamento: dto.formaPagamento,
      responsavel: dto.responsavel,
      observacoes: dto.observacoes,
      empresaId,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    this.contas = [conta, ...this.contas];
    return conta;
  }

  atualizarStatus(empresaId: string, id: string, status: StatusReceber, valorPago?: number, pagamento?: string) {
    const conta = this.obterConta(empresaId, id);
    conta.status = status;
    if (typeof valorPago === 'number') {
      conta.valorPago = valorPago;
    }
    ContaReceberServiceHelpers.ajustarDatasStatus(conta, pagamento);
    conta.atualizadoEm = new Date().toISOString();
    return conta;
  }

  atualizarConta(empresaId: string, id: string, dto: Partial<CreateContaReceberDto>) {
    const conta = this.obterConta(empresaId, id);
    if (dto.titulo !== undefined) conta.titulo = dto.titulo;
    if (dto.cliente !== undefined) conta.cliente = dto.cliente;
    if (dto.valor !== undefined) conta.valor = dto.valor;
    if (dto.valorPago !== undefined) conta.valorPago = dto.valorPago;
    if (dto.emissao !== undefined) conta.emissao = dto.emissao;
    if (dto.vencimento !== undefined) conta.vencimento = dto.vencimento;
    if (dto.pagamento !== undefined) conta.pagamento = dto.pagamento;
    if (dto.status) conta.status = dto.status;
    if (dto.categoria !== undefined) conta.categoria = dto.categoria;
    if (dto.formaPagamento !== undefined) conta.formaPagamento = dto.formaPagamento;
    if (dto.responsavel !== undefined) conta.responsavel = dto.responsavel;
    if (dto.observacoes !== undefined) conta.observacoes = dto.observacoes;
    conta.atualizadoEm = new Date().toISOString();
    return conta;
  }

  removerConta(empresaId: string, id: string) {
    const existe = this.contas.some((conta) => conta.empresaId === empresaId && conta.id === id);
    if (!existe) {
      throw new NotFoundException('Conta a receber não encontrada');
    }
    this.contas = this.contas.filter((conta) => !(conta.empresaId === empresaId && conta.id === id));
  }

  obterEstatisticas(empresaId: string): ContaReceberStats {
    const contas = this.contas.filter((conta) => conta.empresaId === empresaId);
    const stats: ContaReceberStats = {
      totalTitulo: 0,
      totalEmAberto: 0,
      totalRecebido: 0,
      totalVencido: 0,
      quantidadeAberta: 0,
      quantidadeVencida: 0,
      quantidadeRecebida: 0,
    };

    const hoje = new Date();

    contas.forEach((conta) => {
      stats.totalTitulo += conta.valor;
      switch (conta.status) {
        case 'recebida':
          stats.quantidadeRecebida += 1;
          stats.totalRecebido += conta.valorPago;
          break;
        case 'vencida':
          stats.quantidadeVencida += 1;
          stats.totalVencido += conta.valor - conta.valorPago;
          break;
        default:
          if (new Date(conta.vencimento) < hoje) {
            stats.totalVencido += conta.valor - conta.valorPago;
            stats.quantidadeVencida += 1;
          } else {
            stats.totalEmAberto += conta.valor - conta.valorPago;
            stats.quantidadeAberta += 1;
          }
          break;
      }
    });

    return stats;
  }

  listarContasPagar(empresaId: string, filtros?: { status?: StatusPagar | 'todas'; search?: string }) {
    return this.contasPagar.filter((conta) => {
      if (conta.empresaId !== empresaId) return false;
      const statusOk = !filtros?.status || filtros.status === 'todas' || conta.status === filtros.status;
      if (!statusOk) return false;
      if (filtros?.search) {
        const termo = filtros.search.toLowerCase();
        return (
          conta.titulo.toLowerCase().includes(termo) ||
          conta.fornecedor.toLowerCase().includes(termo) ||
          (conta.centroCusto?.toLowerCase().includes(termo) ?? false)
        );
      }
      return true;
    });
  }

  obterContaPagar(empresaId: string, id: string): ContaPagar {
    const conta = this.contasPagar.find((item) => item.empresaId === empresaId && item.id === id);
    if (!conta) {
      throw new NotFoundException('Conta a pagar não encontrada');
    }
    return conta;
  }

  criarContaPagar(dto: CreateContaPagarDto, empresaId: string): ContaPagar {
    const agora = new Date().toISOString();
    const status: StatusPagar = dto.status ?? 'aberta';
    const conta: ContaPagar = {
      id: randomUUID(),
      titulo: dto.titulo,
      fornecedor: dto.fornecedor,
      valor: dto.valor,
      valorPago: dto.valorPago ?? 0,
      emissao: dto.emissao,
      vencimento: dto.vencimento,
      pagamento: dto.pagamento,
      status,
      centroCusto: dto.centroCusto,
      formaPagamento: dto.formaPagamento,
      responsavel: dto.responsavel,
      observacoes: dto.observacoes,
      empresaId,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    this.contasPagar = [conta, ...this.contasPagar];
    return conta;
  }

  atualizarStatusPagar(empresaId: string, id: string, status: StatusPagar, valorPago?: number, pagamento?: string) {
    const conta = this.obterContaPagar(empresaId, id);
    conta.status = status;
    if (typeof valorPago === 'number') {
      conta.valorPago = valorPago;
    }
    if (pagamento) {
      conta.pagamento = pagamento;
    }
    if (status === 'paga') {
      conta.pagamento = pagamento ?? new Date().toISOString().split('T')[0];
      conta.valorPago = conta.valor;
    }
    conta.atualizadoEm = new Date().toISOString();
    return conta;
  }

  atualizarContaPagar(empresaId: string, id: string, dto: Partial<CreateContaPagarDto>) {
    const conta = this.obterContaPagar(empresaId, id);
    if (dto.titulo !== undefined) conta.titulo = dto.titulo;
    if (dto.fornecedor !== undefined) conta.fornecedor = dto.fornecedor;
    if (dto.valor !== undefined) conta.valor = dto.valor;
    if (dto.valorPago !== undefined) conta.valorPago = dto.valorPago;
    if (dto.emissao !== undefined) conta.emissao = dto.emissao;
    if (dto.vencimento !== undefined) conta.vencimento = dto.vencimento;
    if (dto.pagamento !== undefined) conta.pagamento = dto.pagamento;
    if (dto.status) conta.status = dto.status;
    if (dto.centroCusto !== undefined) conta.centroCusto = dto.centroCusto;
    if (dto.formaPagamento !== undefined) conta.formaPagamento = dto.formaPagamento;
    if (dto.responsavel !== undefined) conta.responsavel = dto.responsavel;
    if (dto.observacoes !== undefined) conta.observacoes = dto.observacoes;
    conta.atualizadoEm = new Date().toISOString();
    return conta;
  }

  removerContaPagar(empresaId: string, id: string) {
    const existe = this.contasPagar.some((conta) => conta.empresaId === empresaId && conta.id === id);
    if (!existe) {
      throw new NotFoundException('Conta a pagar não encontrada');
    }
    this.contasPagar = this.contasPagar.filter((conta) => !(conta.empresaId === empresaId && conta.id === id));
  }

  obterEstatisticasPagar(empresaId: string): ContaPagarStats {
    const contas = this.contasPagar.filter((conta) => conta.empresaId === empresaId);
    const stats: ContaPagarStats = {
      totalTitulo: 0,
      totalPago: 0,
      totalAberto: 0,
      totalAtrasado: 0,
      quantidadeAberta: 0,
      quantidadeAtrasada: 0,
      quantidadePaga: 0,
    };

    const hoje = new Date();

    contas.forEach((conta) => {
      stats.totalTitulo += conta.valor;
      switch (conta.status) {
        case 'paga':
          stats.quantidadePaga += 1;
          stats.totalPago += conta.valorPago;
          break;
        case 'atrasada':
          stats.quantidadeAtrasada += 1;
          stats.totalAtrasado += conta.valor - conta.valorPago;
          break;
        default:
          if (new Date(conta.vencimento) < hoje) {
            stats.totalAtrasado += conta.valor - conta.valorPago;
            stats.quantidadeAtrasada += 1;
          } else {
            stats.totalAberto += conta.valor - conta.valorPago;
            stats.quantidadeAberta += 1;
          }
          break;
      }
    });

    return stats;
  }

  listarContasBancarias(empresaId: string) {
    return this.contasBancarias.filter((conta) => conta.empresaId === empresaId);
  }

  obterDashboardBancos(empresaId: string) {
    const contas = this.listarContasBancarias(empresaId);
    const totalSaldo = contas.reduce((acc, conta) => acc + conta.saldoAtual, 0);
    const saldoDisponivel = contas.reduce((acc, conta) => acc + conta.saldoDisponivel, 0);
    const saldoProjetado = contas.reduce((acc, conta) => acc + conta.saldoProjetado, 0);
    const contaPrincipal = contas[0] ?? null;

    return {
      totalSaldo,
      saldoDisponivel,
      saldoProjetado,
      contaPrincipal,
      contas,
    };
  }

  async obterInvestimentos(empresaId: string): Promise<InvestimentoResponse> {
    const [carteiras, ativos, historico, alertas] = await Promise.all([
      this.carteirasRepository.find({ where: { empresaId }, order: { nome: 'ASC' } }),
      this.ativosRepository.find({
        where: { empresaId },
        order: { valorAtual: 'DESC' },
      }),
      this.historicoRepository.find({
        where: { empresaId },
        order: { data: 'ASC' },
      }),
      this.alertasRepository.find({
        where: { empresaId },
        relations: { carteira: true },
        order: { criadoEm: 'DESC' },
      }),
    ]);

    const totalAplicado = ativos.reduce((acc, ativo) => acc + ativo.valorAplicado, 0);
    const totalAtual = ativos.reduce((acc, ativo) => acc + ativo.valorAtual, 0);
    const variacaoPatrimonio = totalAtual - totalAplicado;
    const rentabilidadeAcumulada = totalAplicado > 0 ? (variacaoPatrimonio / totalAplicado) * 100 : 0;
    const rentabilidadeNoMes =
      historico.length > 0 ? historico[historico.length - 1].rentabilidade : 0;

    const distribuicaoPorClasse = ativos.reduce<Record<string, number>>((acc, ativo) => {
      acc[ativo.classe] = (acc[ativo.classe] ?? 0) + ativo.valorAtual;
      return acc;
    }, {});

    const distribuicao = Object.entries(distribuicaoPorClasse).map(([classe, valor]) => ({
      classe: classe as InvestimentoClasse,
      valor,
      percentual: totalAtual > 0 ? (valor / totalAtual) * 100 : 0,
    }));

    return {
      resumo: {
        totalAplicado,
        totalAtual,
        rentabilidadeAcumulada,
        rentabilidadeNoMes,
        variacaoPatrimonio,
      },
      distribuicao,
      carteiras: carteiras.map((carteira) => ({
        id: carteira.id,
        nome: carteira.nome,
        objetivo: carteira.objetivo ?? undefined,
        saldoAplicado: carteira.saldoAplicado,
        saldoAtual: carteira.saldoAtual,
        rentabilidadeMensal: carteira.rentabilidadeMensal,
        rentabilidade12m: carteira.rentabilidade12m,
        risco: carteira.risco,
      })),
      ativos: ativos.map((ativo) => ({
        id: ativo.id,
        carteiraId: ativo.carteiraId,
        ativo: ativo.ativo,
        classe: ativo.classe,
        instituicao: ativo.instituicao,
        valorAplicado: ativo.valorAplicado,
        valorAtual: ativo.valorAtual,
        rentabilidade12m: ativo.rentabilidade12m,
        risco: ativo.risco,
        aplicadoEm: ativo.aplicadoEm ?? undefined,
        atualizadoEm: (ativo.atualizadoEmData ?? ativo.atualizadoEm)?.toISOString?.() ?? undefined,
      })),
      historico: historico.map((item) => ({
        data: item.data,
        rentabilidade: item.rentabilidade,
        aporte: item.aporte ?? undefined,
        resgate: item.resgate ?? undefined,
      })),
      alertas: alertas.map((alerta) => ({
        carteira: alerta.carteira?.nome ?? '',
        recomendacao: alerta.recomendacao,
        impacto: alerta.impacto,
      })),
    };
  }

  listarCarteirasInvestimento(empresaId: string) {
    return this.carteirasRepository.find({ where: { empresaId }, order: { nome: 'ASC' } });
  }

  async criarCarteiraInvestimento(empresaId: string, dto: CreateInvestimentoCarteiraDto) {
    const carteira = this.carteirasRepository.create({
      empresaId,
      nome: dto.nome,
      objetivo: dto.objetivo,
      saldoAplicado: dto.saldoAplicado ?? 0,
      saldoAtual: dto.saldoAtual ?? dto.saldoAplicado ?? 0,
      rentabilidadeMensal: dto.rentabilidadeMensal ?? 0,
      rentabilidade12m: dto.rentabilidade12m ?? 0,
      risco: dto.risco ?? 'medio',
    });
    return this.carteirasRepository.save(carteira);
  }

  async atualizarCarteiraInvestimento(
    empresaId: string,
    id: string,
    dto: UpdateInvestimentoCarteiraDto,
  ) {
    const carteira = await this.ensureCarteira(empresaId, id);
    Object.assign(carteira, dto);
    return this.carteirasRepository.save(carteira);
  }

  async removerCarteiraInvestimento(empresaId: string, id: string) {
    const carteira = await this.ensureCarteira(empresaId, id);
    await this.carteirasRepository.remove(carteira);
  }

  async criarAtivoInvestimento(empresaId: string, dto: CreateInvestimentoAtivoDto) {
    const carteira = await this.ensureCarteira(empresaId, dto.carteiraId);
    const ativo = this.ativosRepository.create({
      empresaId,
      carteiraId: carteira.id,
      ativo: dto.ativo,
      classe: dto.classe,
      instituicao: dto.instituicao,
      valorAplicado: dto.valorAplicado,
      valorAtual: dto.valorAtual,
      rentabilidade12m: dto.rentabilidade12m ?? 0,
      risco: dto.risco ?? 'medio',
      aplicadoEm: dto.aplicadoEm,
      atualizadoEmData: dto.atualizadoEmData ? new Date(dto.atualizadoEmData) : undefined,
    });
    return this.ativosRepository.save(ativo);
  }

  async atualizarAtivoInvestimento(
    empresaId: string,
    id: string,
    dto: UpdateInvestimentoAtivoDto,
  ) {
    const ativo = await this.ensureAtivo(empresaId, id);
    if (dto.carteiraId && dto.carteiraId !== ativo.carteiraId) {
      const carteira = await this.ensureCarteira(empresaId, dto.carteiraId);
      ativo.carteiraId = carteira.id;
    }
    if (dto.atualizadoEmData) {
      ativo.atualizadoEmData = new Date(dto.atualizadoEmData);
    }
    Object.assign(ativo, { ...dto, atualizadoEmData: ativo.atualizadoEmData });
    return this.ativosRepository.save(ativo);
  }

  async removerAtivoInvestimento(empresaId: string, id: string) {
    const ativo = await this.ensureAtivo(empresaId, id);
    await this.ativosRepository.remove(ativo);
  }

  async criarHistoricoInvestimento(empresaId: string, dto: CreateInvestimentoHistoricoDto) {
    let carteiraId: string | null = null;
    if (dto.carteiraId) {
      const carteira = await this.ensureCarteira(empresaId, dto.carteiraId);
      carteiraId = carteira.id;
    }
    const historico = this.historicoRepository.create({
      empresaId,
      carteiraId,
      data: dto.data,
      rentabilidade: dto.rentabilidade,
      aporte: dto.aporte ?? null,
      resgate: dto.resgate ?? null,
    });
    return this.historicoRepository.save(historico);
  }

  async removerHistoricoInvestimento(empresaId: string, id: string) {
    const historico = await this.historicoRepository.findOne({ where: { id, empresaId } });
    if (!historico) {
      throw new NotFoundException('Registro de histórico não encontrado');
    }
    await this.historicoRepository.remove(historico);
  }

  async criarAlertaInvestimento(empresaId: string, dto: CreateInvestimentoAlertaDto) {
    let carteiraId: string | null = null;
    if (dto.carteiraId) {
      const carteira = await this.ensureCarteira(empresaId, dto.carteiraId);
      carteiraId = carteira.id;
    }
    const alerta = this.alertasRepository.create({
      empresaId,
      carteiraId,
      recomendacao: dto.recomendacao,
      impacto: dto.impacto ?? 'medio',
    });
    return this.alertasRepository.save(alerta);
  }

  async removerAlertaInvestimento(empresaId: string, id: string) {
    const alerta = await this.alertasRepository.findOne({ where: { id, empresaId } });
    if (!alerta) {
      throw new NotFoundException('Alerta de investimento não encontrado');
    }
    await this.alertasRepository.remove(alerta);
  }

  async obterOrcamento(empresaId: string): Promise<OrcamentoResponse> {
    const [centros, alertas] = await Promise.all([
      this.orcamentoCentroRepository.find({
        where: { empresaId },
        relations: { metas: true },
        order: { centroCusto: 'ASC' },
      }),
      this.orcamentoAlertasRepository.find({
        where: { empresaId },
        order: { atualizadoEm: 'DESC' },
      }),
    ]);

    const linhas: OrcamentoLinhaCentroCusto[] = centros.map((centro) => ({
      empresaId: centro.empresaId,
      id: centro.id,
      centroCusto: centro.centroCusto,
      categoria: centro.categoria,
      tipo: centro.tipo,
      periodo: centro.periodo,
      metaAnual: centro.metaAnual,
      realizadoAnual: centro.realizadoAnual,
      variacaoPercentual: centro.variacaoPercentual,
      metasMensais:
        centro.metas
          ?.map((meta) => ({
            id: meta.id,
            mes: meta.mes,
            meta: meta.meta,
            realizado: meta.realizado,
          }))
          .sort((a, b) => a.mes.localeCompare(b.mes)) ?? [],
    }));

    const totalReceitasPlanejadas = linhas
      .filter((linha) => linha.tipo === 'receita')
      .reduce((acc, linha) => acc + linha.metaAnual, 0);
    const totalReceitasRealizadas = linhas
      .filter((linha) => linha.tipo === 'receita')
      .reduce((acc, linha) => acc + linha.realizadoAnual, 0);

    const totalDespesasPlanejadas = linhas
      .filter((linha) => linha.tipo === 'despesa')
      .reduce((acc, linha) => acc + linha.metaAnual, 0);
    const totalDespesasRealizadas = linhas
      .filter((linha) => linha.tipo === 'despesa')
      .reduce((acc, linha) => acc + linha.realizadoAnual, 0);

    const resultadoPlanejado = totalReceitasPlanejadas - totalDespesasPlanejadas;
    const resultadoRealizado = totalReceitasRealizadas - totalDespesasRealizadas;
    const variacaoResultado =
      resultadoPlanejado !== 0
        ? ((resultadoRealizado - resultadoPlanejado) / Math.abs(resultadoPlanejado)) * 100
        : 0;

    const alertasFormatados: OrcamentoAlerta[] = alertas.map((alerta) => ({
      centroCusto: alerta.centroCusto,
      categoria: alerta.categoria,
      variacaoPercentual: Number(alerta.variacaoPercentual),
      mensagem: alerta.mensagem,
      impacto: alerta.impacto,
    }));

    const timestamps: number[] = [];
    centros.forEach((centro) => {
      timestamps.push(centro.atualizadoEm?.getTime?.() ?? Date.now());
      centro.metas?.forEach((meta) => timestamps.push(meta.atualizadoEm?.getTime?.() ?? Date.now()));
    });
    alertas.forEach((alerta) => timestamps.push(alerta.atualizadoEm?.getTime?.() ?? Date.now()));

    const ultimoAtualizadoEm = timestamps.length
      ? new Date(Math.max(...timestamps)).toISOString()
      : new Date().toISOString();

    return {
      resumo: {
        totalReceitasPlanejadas,
        totalReceitasRealizadas,
        totalDespesasPlanejadas,
        totalDespesasRealizadas,
        resultadoPlanejado,
        resultadoRealizado,
        variacaoResultado,
      },
      linhas,
      alertas: alertasFormatados,
      ultimoAtualizadoEm,
    };
  }

  listarOrcamentoLinhas(empresaId: string) {
    return this.orcamentoCentroRepository.find({
      where: { empresaId },
      relations: { metas: true },
      order: { centroCusto: 'ASC' },
    });
  }

  async criarOrcamentoLinha(empresaId: string, dto: CreateOrcamentoCentroDto) {
    const centro = this.orcamentoCentroRepository.create({
      empresaId,
      centroCusto: dto.centroCusto,
      categoria: dto.categoria,
      tipo: dto.tipo,
      periodo: dto.periodo ?? 'mensal',
      metaAnual: dto.metaAnual,
      realizadoAnual: dto.realizadoAnual ?? 0,
      variacaoPercentual: dto.variacaoPercentual ?? 0,
    });
    return this.orcamentoCentroRepository.save(centro);
  }

  async atualizarOrcamentoLinha(
    empresaId: string,
    id: string,
    dto: UpdateOrcamentoCentroDto,
  ) {
    const centro = await this.ensureOrcamentoCentro(empresaId, id);
    Object.assign(centro, dto);
    return this.orcamentoCentroRepository.save(centro);
  }

  async removerOrcamentoLinha(empresaId: string, id: string) {
    const centro = await this.ensureOrcamentoCentro(empresaId, id);
    await this.orcamentoCentroRepository.remove(centro);
  }

  async criarOrcamentoMeta(empresaId: string, dto: CreateOrcamentoMetaDto) {
    const centro = await this.ensureOrcamentoCentro(empresaId, dto.centroId);
    const meta = this.orcamentoMetaRepository.create({
      empresaId,
      centroId: centro.id,
      mes: dto.mes,
      meta: dto.meta,
      realizado: dto.realizado ?? 0,
    });
    return this.orcamentoMetaRepository.save(meta);
  }

  async atualizarOrcamentoMeta(
    empresaId: string,
    id: string,
    dto: UpdateOrcamentoMetaDto,
  ) {
    const meta = await this.ensureOrcamentoMeta(empresaId, id);
    if (dto.centroId && dto.centroId !== meta.centroId) {
      const centro = await this.ensureOrcamentoCentro(empresaId, dto.centroId);
      meta.centroId = centro.id;
    }
    Object.assign(meta, dto);
    return this.orcamentoMetaRepository.save(meta);
  }

  async removerOrcamentoMeta(empresaId: string, id: string) {
    const meta = await this.ensureOrcamentoMeta(empresaId, id);
    await this.orcamentoMetaRepository.remove(meta);
  }

  async criarOrcamentoAlerta(empresaId: string, dto: CreateOrcamentoAlertaDto) {
    let centroId: string | null = null;
    if (dto.centroId) {
      const centro = await this.ensureOrcamentoCentro(empresaId, dto.centroId);
      centroId = centro.id;
    } else {
      const possivelCentro = await this.orcamentoCentroRepository.findOne({
        where: { empresaId, centroCusto: dto.centroCusto },
      });
      centroId = possivelCentro?.id ?? null;
    }

    const alerta = this.orcamentoAlertasRepository.create({
      empresaId,
      centroId,
      centroCusto: dto.centroCusto,
      categoria: dto.categoria,
      variacaoPercentual: dto.variacaoPercentual,
      mensagem: dto.mensagem,
      impacto: dto.impacto ?? 'medio',
    });
    return this.orcamentoAlertasRepository.save(alerta);
  }

  async removerOrcamentoAlerta(empresaId: string, id: string) {
    const alerta = await this.orcamentoAlertasRepository.findOne({ where: { id, empresaId } });
    if (!alerta) {
      throw new NotFoundException('Alerta de orçamento não encontrado');
    }
    await this.orcamentoAlertasRepository.remove(alerta);
  }

  obterFluxoCaixa(empresaId: string, dias?: number) {
    const rangeDias = dias && dias > 0 ? Math.min(dias, 180) : 30;
    const hojeBase = new Date();
    const hoje = new Date(hojeBase.getFullYear(), hojeBase.getMonth(), hojeBase.getDate());
    const umDiaMs = 24 * 60 * 60 * 1000;
    const inicio = new Date(hoje.getTime() - (rangeDias - 1) * umDiaMs);
    const fim = new Date(hoje.getTime() + (rangeDias - 1) * umDiaMs);

    const mapa = new Map<string, { entradas: number; saidas: number }>();

    const registrar = (data: Date, tipo: 'entrada' | 'saida', valor: number) => {
      const dia = new Date(data.getFullYear(), data.getMonth(), data.getDate());
      if (dia < inicio || dia > fim) {
        return;
      }
      const chave = dia.toISOString().split('T')[0];
      if (!mapa.has(chave)) {
        mapa.set(chave, { entradas: 0, saidas: 0 });
      }
      const atual = mapa.get(chave)!;
      if (tipo === 'entrada') {
        atual.entradas += valor;
      } else {
        atual.saidas += valor;
      }
    };

    this.contas
      .filter((conta) => conta.empresaId === empresaId)
      .forEach((conta) => {
        const valor = conta.status === 'recebida' ? conta.valorPago : conta.valor;
        const dataReferencia = conta.status === 'recebida' && conta.pagamento ? conta.pagamento : conta.vencimento;
        registrar(new Date(dataReferencia), 'entrada', valor);
      });

    this.contasPagar
      .filter((conta) => conta.empresaId === empresaId)
      .forEach((conta) => {
        const valor = conta.status === 'paga' ? conta.valorPago : conta.valor;
        const dataReferencia = conta.status === 'paga' && conta.pagamento ? conta.pagamento : conta.vencimento;
        registrar(new Date(dataReferencia), 'saida', valor);
      });

    const historico: Array<{
      data: string;
      entradas: number;
      saidas: number;
      saldoDiario: number;
      saldoAcumulado: number;
    }> = [];

    let saldoAcumulado = 0;
    const totalDias = Math.round((fim.getTime() - inicio.getTime()) / umDiaMs) + 1;
    for (let i = 0; i < totalDias; i++) {
      const dia = new Date(inicio.getTime() + i * umDiaMs);
      const chave = dia.toISOString().split('T')[0];
      const valores = mapa.get(chave) ?? { entradas: 0, saidas: 0 };
      const saldoDiario = valores.entradas - valores.saidas;
      saldoAcumulado += saldoDiario;
      historico.push({
        data: chave,
        entradas: valores.entradas,
        saidas: valores.saidas,
        saldoDiario,
        saldoAcumulado,
      });
    }

    const resumo = historico.reduce(
      (acc, dia) => {
        acc.entradas += dia.entradas;
        acc.saidas += dia.saidas;
        return acc;
      },
      { entradas: 0, saidas: 0 }
    );
    const saldo = resumo.entradas - resumo.saidas;

    const proximosEventos = [
      ...this.contas
        .filter((conta) => conta.empresaId === empresaId)
        .map((conta) => ({
          tipo: 'receber' as const,
          titulo: conta.titulo,
          pessoa: conta.cliente,
          valor: conta.valor,
          data: conta.status === 'recebida' && conta.pagamento ? conta.pagamento : conta.vencimento,
          status: conta.status,
        })),
      ...this.contasPagar
        .filter((conta) => conta.empresaId === empresaId)
        .map((conta) => ({
          tipo: 'pagar' as const,
          titulo: conta.titulo,
          pessoa: conta.fornecedor,
          valor: conta.valor,
          data: conta.status === 'paga' && conta.pagamento ? conta.pagamento : conta.vencimento,
          status: conta.status,
        })),
    ]
      .filter((evento) => {
        const data = new Date(evento.data);
        const dia = new Date(data.getFullYear(), data.getMonth(), data.getDate());
        return dia >= inicio;
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 8);

    return {
      periodo: {
        inicio: inicio.toISOString().split('T')[0],
        fim: fim.toISOString().split('T')[0],
      },
      resumo: {
        entradas: resumo.entradas,
        saidas: resumo.saidas,
        saldo,
      },
      historico,
      proximosEventos,
    };
  }

  obterConsolidadoConcilicao(empresaId: string) {
    const contas = this.listarContasBancarias(empresaId);
    const receber = this.listarContasReceber(empresaId, { status: 'aberta' });
    const pagar = this.listarContasPagar(empresaId, { status: 'aberta' });

    const totalSaldoBanco = contas.reduce((acc, conta) => acc + conta.saldoDisponivel, 0);
    const totalReceber = receber.reduce((acc, conta) => acc + Math.max(conta.valor - conta.valorPago, 0), 0);
    const totalPagar = pagar.reduce((acc, conta) => acc + Math.max(conta.valor - conta.valorPago, 0), 0);
    const saldoProjetado = totalSaldoBanco + totalReceber - totalPagar;

    const pendencias = pagar
      .filter((conta) => new Date(conta.vencimento) < new Date())
      .slice(0, 5)
      .map((conta) => ({
        tipo: 'pagar' as const,
        titulo: conta.titulo,
        pessoa: conta.fornecedor,
        valor: conta.valor,
        vencimento: conta.vencimento,
        status: conta.status,
      }));

    const recebimentos = receber
      .filter((conta) => new Date(conta.vencimento) <= new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000))
      .slice(0, 5)
      .map((conta) => ({
        tipo: 'receber' as const,
        titulo: conta.titulo,
        pessoa: conta.cliente,
        valor: conta.valor,
        vencimento: conta.vencimento,
        status: conta.status,
      }));

    return {
      bancos: contas,
      totalSaldoBanco,
      totalReceber,
      totalPagar,
      saldoProjetado,
      pendencias,
      recebimentos,
    };
  }

  obterTesouraria(empresaId: string) {
    const contas = this.listarContasBancarias(empresaId);
    const fluxo = this.obterFluxoCaixa(empresaId, 30);
    const receber = this.listarContasReceber(empresaId);
    const pagar = this.listarContasPagar(empresaId);

    const resumoBancos = this.obterDashboardBancos(empresaId);
    const resumoFluxo = fluxo.resumo;
    const contasPrioritarias = pagar.filter((conta) => conta.status === 'atrasada').slice(0, 5);
    const entradasEsperadas = receber.filter((conta) => conta.status === 'aberta').slice(0, 5);

    return {
      bancos: resumoBancos,
      fluxoCaixa: fluxo,
      contasAtrasadas: contasPrioritarias,
      entradasEsperadas,
      indicadores: {
        saldoHoje: resumoBancos.totalSaldo,
        saldoProjetado: resumoBancos.saldoProjetado,
        fluxoPeriodo: resumoFluxo.saldo,
        contasConectadas: contas.length,
      },
    };
  }

  private async ensureCarteira(empresaId: string, id: string) {
    const carteira = await this.carteirasRepository.findOne({ where: { id, empresaId } });
    if (!carteira) {
      throw new NotFoundException('Carteira de investimento não encontrada');
    }
    return carteira;
  }

  private async ensureAtivo(empresaId: string, id: string) {
    const ativo = await this.ativosRepository.findOne({ where: { id, empresaId } });
    if (!ativo) {
      throw new NotFoundException('Ativo de investimento não encontrado');
    }
    return ativo;
  }

  private async ensureOrcamentoCentro(empresaId: string, id: string) {
    const centro = await this.orcamentoCentroRepository.findOne({ where: { id, empresaId } });
    if (!centro) {
      throw new NotFoundException('Centro de custo de orçamento não encontrado');
    }
    return centro;
  }

  private async ensureOrcamentoMeta(empresaId: string, id: string) {
    const meta = await this.orcamentoMetaRepository.findOne({ where: { id, empresaId } });
    if (!meta) {
      throw new NotFoundException('Meta de orçamento não encontrada');
    }
    return meta;
  }
}

class ContaReceberServiceHelpers {
  static ajustarDatasStatus(conta: ContaReceber, pagamento?: string) {
    if (conta.status === 'recebida') {
      conta.pagamento = pagamento ?? new Date().toISOString().split('T')[0];
      conta.valorPago = conta.valor;
    } else if (pagamento) {
      conta.pagamento = pagamento;
    }
  }
}







