import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanoContaEntity } from './plano-conta.entity';

@Injectable()
export class ContabilService {
  constructor(
    @InjectRepository(PlanoContaEntity)
    private readonly planoContaRepo: Repository<PlanoContaEntity>,
  ) {}

  async listarPlanoContas(empresaId: string, filtros?: { tipo?: string }) {
    const query = this.planoContaRepo
      .createQueryBuilder('conta')
      .where('conta.empresaId = :empresaId', { empresaId });

    if (filtros?.tipo) {
      query.andWhere('conta.tipo = :tipo', { tipo: filtros.tipo });
    }

    return query.orderBy('conta.codigo', 'ASC').getMany();
  }

  async criarConta(empresaId: string, data: Partial<PlanoContaEntity>) {
    const conta = this.planoContaRepo.create({ ...data, empresaId });
    return this.planoContaRepo.save(conta);
  }

  async atualizarConta(id: number, empresaId: string, data: Partial<PlanoContaEntity>) {
    const conta = await this.planoContaRepo.findOne({ where: { id, empresaId } });
    if (!conta) {
      throw new NotFoundException('Conta não encontrada');
    }
    Object.assign(conta, data);
    return this.planoContaRepo.save(conta);
  }

  async excluirConta(id: number, empresaId: string) {
    const conta = await this.planoContaRepo.findOne({ where: { id, empresaId } });
    if (!conta) {
      throw new NotFoundException('Conta não encontrada');
    }
    await this.planoContaRepo.remove(conta);
  }
}

