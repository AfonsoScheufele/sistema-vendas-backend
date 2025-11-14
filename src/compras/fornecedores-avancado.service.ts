import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FornecedorAvaliacaoEntity } from './fornecedor-avaliacao.entity';

@Injectable()
export class FornecedoresAvancadoService {
  constructor(
    @InjectRepository(FornecedorAvaliacaoEntity)
    private readonly avaliacaoRepo: Repository<FornecedorAvaliacaoEntity>,
  ) {}

  async listarAvaliacoes(empresaId: string, fornecedorId?: number) {
    const query = this.avaliacaoRepo
      .createQueryBuilder('av')
      .where('av.empresaId = :empresaId', { empresaId });

    if (fornecedorId) {
      query.andWhere('av.fornecedorId = :fornecedorId', { fornecedorId });
    }

    return query.orderBy('av.criadoEm', 'DESC').getMany();
  }

  async criarAvaliacao(empresaId: string, data: Partial<FornecedorAvaliacaoEntity>) {
    const avaliacao = this.avaliacaoRepo.create({ ...data, empresaId });
    return this.avaliacaoRepo.save(avaliacao);
  }

  async obterMediaFornecedor(empresaId: string, fornecedorId: number) {
    const avaliacoes = await this.listarAvaliacoes(empresaId, fornecedorId);
    if (avaliacoes.length === 0) {
      return {
        notaGeral: 0,
        notaQualidade: 0,
        notaPrazo: 0,
        notaPreco: 0,
        notaAtendimento: 0,
        totalAvaliacoes: 0,
      };
    }

    const soma = avaliacoes.reduce(
      (acc, av) => ({
        notaGeral: acc.notaGeral + Number(av.notaGeral),
        notaQualidade: acc.notaQualidade + Number(av.notaQualidade),
        notaPrazo: acc.notaPrazo + Number(av.notaPrazo),
        notaPreco: acc.notaPreco + Number(av.notaPreco),
        notaAtendimento: acc.notaAtendimento + Number(av.notaAtendimento),
      }),
      { notaGeral: 0, notaQualidade: 0, notaPrazo: 0, notaPreco: 0, notaAtendimento: 0 },
    );

    const total = avaliacoes.length;
    return {
      notaGeral: soma.notaGeral / total,
      notaQualidade: soma.notaQualidade / total,
      notaPrazo: soma.notaPrazo / total,
      notaPreco: soma.notaPreco / total,
      notaAtendimento: soma.notaAtendimento / total,
      totalAvaliacoes: total,
    };
  }
}

