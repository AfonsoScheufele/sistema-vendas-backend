import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orcamento } from './orcamento.entity';

@Injectable()
export class OrcamentosService {
  constructor(
    @InjectRepository(Orcamento)
    private orcamentoRepo: Repository<Orcamento>,
  ) {}

  async listarOrcamentos(): Promise<Orcamento[]> {
    return await this.orcamentoRepo.find({
      relations: ['cliente', 'vendedor'],
      order: { createdAt: 'DESC' }
    });
  }

  async obterEstatisticas() {
    const total = await this.orcamentoRepo.count();
    const pendentes = await this.orcamentoRepo.count({ where: { status: 'pendente' } });
    const aceitos = await this.orcamentoRepo.count({ where: { status: 'aceito' } });
    const recusados = await this.orcamentoRepo.count({ where: { status: 'recusado' } });

    return {
      total,
      pendentes,
      aceitos,
      recusados
    };
  }
}

