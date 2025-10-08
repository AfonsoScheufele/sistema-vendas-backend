import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banco } from './banco.entity';
import { MovimentacaoFinanceira } from './movimentacao-financeira.entity';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Banco)
    private bancoRepo: Repository<Banco>,
    @InjectRepository(MovimentacaoFinanceira)
    private movimentacaoRepo: Repository<MovimentacaoFinanceira>,
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
}

