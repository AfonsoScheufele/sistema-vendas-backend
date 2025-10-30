import { Injectable, NotFoundException } from '@nestjs/common';
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

  async buscarPorId(id: number): Promise<Orcamento> {
    const orcamento = await this.orcamentoRepo.findOne({ where: { id } });
    if (!orcamento) throw new NotFoundException('Orçamento não encontrado');
    return orcamento;
  }

  async criar(data: Partial<Orcamento>): Promise<Orcamento> {
    const orcamento = this.orcamentoRepo.create(data);
    return await this.orcamentoRepo.save(orcamento);
  }

  async atualizar(id: number, data: Partial<Orcamento>): Promise<Orcamento> {
    await this.orcamentoRepo.update(id, data);
    return await this.buscarPorId(id);
  }

  async excluir(id: number): Promise<void> {
    const result = await this.orcamentoRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Orçamento não encontrado');
    }
  }

  async converterEmPedido(id: number): Promise<any> {
    return { message: 'Conversão em pedido realizada', orcamentoId: id };
  }

  async obterEstatisticas() {
    const total = await this.orcamentoRepo.count();
    const pendentes = await this.orcamentoRepo.count({ where: { status: 'pendente' } });
    const aceitos = await this.orcamentoRepo.count({ where: { status: 'aceito' } });
    const recusados = await this.orcamentoRepo.count({ where: { status: 'recusado' } });

    return {
      totalOrcamentos: total,
      orcamentosPendentes: pendentes,
      orcamentosAprovados: aceitos,
      valorTotal: 0,
      taxaConversao: 0
    };
  }
}




