import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banco } from './banco.entity';
import { MovimentacaoFinanceira } from './movimentacao-financeira.entity';
import { Investimento } from './investimento.entity';
import { OrcamentoFinanceiro } from './orcamento-financeiro.entity';
import { Usuario } from '../auth/usuario.entity';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Banco)
    private bancoRepo: Repository<Banco>,
    @InjectRepository(MovimentacaoFinanceira)
    private movimentacaoRepo: Repository<MovimentacaoFinanceira>,
    @InjectRepository(Investimento)
    private investimentoRepo: Repository<Investimento>,
    @InjectRepository(OrcamentoFinanceiro)
    private orcamentoRepo: Repository<OrcamentoFinanceiro>,
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
  ) {}

  // Gestão de Bancos
  async criarBanco(createBancoDto: any): Promise<Banco> {
    const banco = this.bancoRepo.create(createBancoDto);
    return await this.bancoRepo.save(banco) as unknown as Banco;
  }

  async listarBancos(): Promise<Banco[]> {
    return await this.bancoRepo.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async obterBanco(id: number): Promise<Banco> {
    const banco = await this.bancoRepo.findOne({ where: { id } });
    
    if (!banco) {
      throw new NotFoundException('Banco não encontrado');
    }
    
    return banco;
  }

  // Movimentações Financeiras
  async criarMovimentacao(createMovimentacaoDto: any): Promise<MovimentacaoFinanceira> {
    const banco = await this.obterBanco(createMovimentacaoDto.bancoId);
    
    const movimentacao = this.movimentacaoRepo.create(createMovimentacaoDto);
    const movimentacaoSalva = await this.movimentacaoRepo.save(movimentacao);

    // Atualizar saldo do banco
    if (createMovimentacaoDto.tipo === 'receita') {
      banco.saldo += createMovimentacaoDto.valor;
    } else if (createMovimentacaoDto.tipo === 'despesa') {
      banco.saldo -= createMovimentacaoDto.valor;
    }

    await this.bancoRepo.save(banco);

    return movimentacaoSalva as unknown as MovimentacaoFinanceira;
  }

  async listarMovimentacoes(filtros?: any): Promise<MovimentacaoFinanceira[]> {
    const query = this.movimentacaoRepo
      .createQueryBuilder('movimentacao')
      .leftJoinAndSelect('movimentacao.banco', 'banco');

    if (filtros?.bancoId) {
      query.where('movimentacao.bancoId = :bancoId', { bancoId: filtros.bancoId });
    }

    if (filtros?.tipo) {
      query.andWhere('movimentacao.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros?.status) {
      query.andWhere('movimentacao.status = :status', { status: filtros.status });
    }

    if (filtros?.dataInicio && filtros?.dataFim) {
      query.andWhere('movimentacao.dataMovimentacao BETWEEN :dataInicio AND :dataFim', {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
    }

    return await query
      .orderBy('movimentacao.dataMovimentacao', 'DESC')
      .getMany();
  }

  async obterFluxoCaixa(periodo: string = '30d'): Promise<any[]> {
    const dataInicio = new Date();
    const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90;
    dataInicio.setDate(dataInicio.getDate() - dias);

    const movimentacoes = await this.movimentacaoRepo
      .createQueryBuilder('movimentacao')
      .where('movimentacao.dataMovimentacao >= :dataInicio', { dataInicio })
      .orderBy('movimentacao.dataMovimentacao', 'ASC')
      .getMany();

    const fluxoPorDia = {};
    let saldoAcumulado = 0;

    for (const mov of movimentacoes) {
      const data = mov.dataMovimentacao.toISOString().split('T')[0];
      
      if (!fluxoPorDia[data]) {
        fluxoPorDia[data] = {
          data,
          receitas: 0,
          despesas: 0,
          saldo: 0,
        };
      }

      if (mov.tipo === 'receita') {
        fluxoPorDia[data].receitas += mov.valor;
        saldoAcumulado += mov.valor;
      } else if (mov.tipo === 'despesa') {
        fluxoPorDia[data].despesas += mov.valor;
        saldoAcumulado -= mov.valor;
      }

      fluxoPorDia[data].saldo = saldoAcumulado;
    }

    return Object.values(fluxoPorDia);
  }

  async obterResumoFinanceiro(): Promise<any> {
    const [
      totalReceitas,
      totalDespesas,
      saldoTotal,
      contasPagar,
      contasReceber,
      movimentacoesHoje
    ] = await Promise.all([
      this.movimentacaoRepo
        .createQueryBuilder('movimentacao')
        .select('SUM(movimentacao.valor)', 'total')
        .where('movimentacao.tipo = :tipo', { tipo: 'receita' })
        .andWhere('movimentacao.status = :status', { status: 'pago' })
        .getRawOne(),

      this.movimentacaoRepo
        .createQueryBuilder('movimentacao')
        .select('SUM(movimentacao.valor)', 'total')
        .where('movimentacao.tipo = :tipo', { tipo: 'despesa' })
        .andWhere('movimentacao.status = :status', { status: 'pago' })
        .getRawOne(),

      this.bancoRepo
        .createQueryBuilder('banco')
        .select('SUM(banco.saldo)', 'total')
        .where('banco.ativo = :ativo', { ativo: true })
        .getRawOne(),

      this.movimentacaoRepo
        .createQueryBuilder('movimentacao')
        .select('SUM(movimentacao.valor)', 'total')
        .where('movimentacao.tipo = :tipo', { tipo: 'despesa' })
        .andWhere('movimentacao.status = :status', { status: 'pendente' })
        .getRawOne(),

      this.movimentacaoRepo
        .createQueryBuilder('movimentacao')
        .select('SUM(movimentacao.valor)', 'total')
        .where('movimentacao.tipo = :tipo', { tipo: 'receita' })
        .andWhere('movimentacao.status = :status', { status: 'pendente' })
        .getRawOne(),

      this.movimentacaoRepo.count({
        where: {
          dataMovimentacao: new Date(new Date().setHours(0, 0, 0, 0)) as any,
        },
      }),
    ]);

    return {
      totalReceitas: Number(totalReceitas?.total || 0),
      totalDespesas: Number(totalDespesas?.total || 0),
      saldoTotal: Number(saldoTotal?.total || 0),
      contasPagar: Number(contasPagar?.total || 0),
      contasReceber: Number(contasReceber?.total || 0),
      movimentacoesHoje,
      lucroPrejuizo: Number(totalReceitas?.total || 0) - Number(totalDespesas?.total || 0),
    };
  }

  // Investimentos
  async listarInvestimentos(filtros?: any): Promise<Investimento[]> {
    const query = this.investimentoRepo
      .createQueryBuilder('investimento')
      .leftJoinAndSelect('investimento.responsavel', 'responsavel');

    if (filtros?.tipo) {
      query.where('investimento.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros?.status) {
      query.andWhere('investimento.status = :status', { status: filtros.status });
    }

    if (filtros?.responsavelId) {
      query.andWhere('investimento.responsavelId = :responsavelId', { responsavelId: filtros.responsavelId });
    }

    return await query
      .orderBy('investimento.dataInvestimento', 'DESC')
      .getMany();
  }

  async criarInvestimento(createInvestimentoDto: any): Promise<Investimento> {
    const investimento = this.investimentoRepo.create(createInvestimentoDto);
    return await this.investimentoRepo.save(investimento) as unknown as Investimento;
  }

  async obterInvestimento(id: number): Promise<Investimento> {
    const investimento = await this.investimentoRepo.findOne({
      where: { id },
      relations: ['responsavel'],
    });

    if (!investimento) {
      throw new NotFoundException('Investimento não encontrado');
    }

    return investimento;
  }

  async atualizarInvestimento(id: number, updateInvestimentoDto: any): Promise<Investimento> {
    const investimento = await this.obterInvestimento(id);
    
    Object.assign(investimento, updateInvestimentoDto);
    
    // Recalcular rentabilidade
    if (updateInvestimentoDto.valorAtual) {
      investimento.rentabilidade = ((investimento.valorAtual - investimento.valorInvestido) / investimento.valorInvestido) * 100;
    }
    
    return await this.investimentoRepo.save(investimento);
  }

  async resgatarInvestimento(id: number, resgateDto: any): Promise<Investimento> {
    const investimento = await this.obterInvestimento(id);
    
    if (investimento.status !== 'ativo') {
      throw new BadRequestException('Apenas investimentos ativos podem ser resgatados');
    }

    investimento.status = 'resgatado';
    investimento.valorAtual = resgateDto.valorResgate;
    investimento.rentabilidade = ((investimento.valorAtual - investimento.valorInvestido) / investimento.valorInvestido) * 100;
    
    return await this.investimentoRepo.save(investimento);
  }

  async removerInvestimento(id: number): Promise<void> {
    const investimento = await this.obterInvestimento(id);
    await this.investimentoRepo.remove(investimento);
  }

  // Orçamentos Financeiros
  async listarOrcamentos(filtros?: any): Promise<OrcamentoFinanceiro[]> {
    const query = this.orcamentoRepo
      .createQueryBuilder('orcamento')
      .leftJoinAndSelect('orcamento.responsavel', 'responsavel');

    if (filtros?.tipo) {
      query.where('orcamento.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros?.categoria) {
      query.andWhere('orcamento.categoria = :categoria', { categoria: filtros.categoria });
    }

    if (filtros?.status) {
      query.andWhere('orcamento.status = :status', { status: filtros.status });
    }

    if (filtros?.responsavelId) {
      query.andWhere('orcamento.responsavelId = :responsavelId', { responsavelId: filtros.responsavelId });
    }

    return await query
      .orderBy('orcamento.dataInicio', 'DESC')
      .getMany();
  }

  async criarOrcamento(createOrcamentoDto: any): Promise<OrcamentoFinanceiro> {
    const orcamento = this.orcamentoRepo.create({
      ...createOrcamentoDto,
      valorRestante: createOrcamentoDto.valorOrcado,
    });
    return await this.orcamentoRepo.save(orcamento) as unknown as OrcamentoFinanceiro;
  }

  async obterOrcamento(id: number): Promise<OrcamentoFinanceiro> {
    const orcamento = await this.orcamentoRepo.findOne({
      where: { id },
      relations: ['responsavel'],
    });

    if (!orcamento) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    return orcamento;
  }

  async atualizarOrcamento(id: number, updateOrcamentoDto: any): Promise<OrcamentoFinanceiro> {
    const orcamento = await this.obterOrcamento(id);
    
    Object.assign(orcamento, updateOrcamentoDto);
    
    // Recalcular valor restante
    orcamento.valorRestante = orcamento.valorOrcado - orcamento.valorGasto;
    
    return await this.orcamentoRepo.save(orcamento);
  }

  async registrarGasto(id: number, gastoDto: any): Promise<OrcamentoFinanceiro> {
    const orcamento = await this.obterOrcamento(id);
    
    if (orcamento.status !== 'ativo') {
      throw new BadRequestException('Apenas orçamentos ativos podem ter gastos registrados');
    }

    if (orcamento.valorRestante < gastoDto.valor) {
      throw new BadRequestException('Valor do gasto excede o orçamento disponível');
    }

    orcamento.valorGasto += gastoDto.valor;
    orcamento.valorRestante = orcamento.valorOrcado - orcamento.valorGasto;
    
    return await this.orcamentoRepo.save(orcamento);
  }

  async removerOrcamento(id: number): Promise<void> {
    const orcamento = await this.obterOrcamento(id);
    await this.orcamentoRepo.remove(orcamento);
  }

  // Relatórios Financeiros
  async obterRelatorioInvestimentos(filtros?: any): Promise<any> {
    const query = this.investimentoRepo.createQueryBuilder('investimento');

    if (filtros?.dataInicio && filtros?.dataFim) {
      query.andWhere('investimento.dataInvestimento BETWEEN :dataInicio AND :dataFim', {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
    }

    const totalInvestido = await query
      .select('SUM(investimento.valorInvestido)', 'total')
      .getRawOne();

    const totalAtual = await query
      .select('SUM(investimento.valorAtual)', 'total')
      .getRawOne();

    const investimentosPorTipo = await query
      .select('investimento.tipo, COUNT(*) as quantidade, SUM(investimento.valorInvestido) as total')
      .groupBy('investimento.tipo')
      .getRawMany();

    return {
      totalInvestido: parseFloat(totalInvestido?.total || '0'),
      totalAtual: parseFloat(totalAtual?.total || '0'),
      rentabilidadeTotal: parseFloat(totalAtual?.total || '0') - parseFloat(totalInvestido?.total || '0'),
      investimentosPorTipo,
    };
  }

  async obterRelatorioOrcamentos(filtros?: any): Promise<any> {
    const query = this.orcamentoRepo.createQueryBuilder('orcamento');

    if (filtros?.dataInicio && filtros?.dataFim) {
      query.andWhere('orcamento.dataInicio BETWEEN :dataInicio AND :dataFim', {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
    }

    const totalOrcado = await query
      .select('SUM(orcamento.valorOrcado)', 'total')
      .getRawOne();

    const totalGasto = await query
      .select('SUM(orcamento.valorGasto)', 'total')
      .getRawOne();

    const orcamentosPorCategoria = await query
      .select('orcamento.categoria, COUNT(*) as quantidade, SUM(orcamento.valorOrcado) as totalOrcado, SUM(orcamento.valorGasto) as totalGasto')
      .groupBy('orcamento.categoria')
      .getRawMany();

    return {
      totalOrcado: parseFloat(totalOrcado?.total || '0'),
      totalGasto: parseFloat(totalGasto?.total || '0'),
      totalRestante: parseFloat(totalOrcado?.total || '0') - parseFloat(totalGasto?.total || '0'),
      orcamentosPorCategoria,
    };
  }
}

