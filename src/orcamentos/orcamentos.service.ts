import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orcamento } from './orcamento.entity';

interface OrcamentoFiltros {
  status?: string;
  search?: string;
}

@Injectable()
export class OrcamentosService {
  constructor(
    @InjectRepository(Orcamento)
    private readonly orcamentoRepo: Repository<Orcamento>,
  ) {}

  async listarOrcamentos(empresaId: string, filtros?: OrcamentoFiltros): Promise<Orcamento[]> {
    const query = this.orcamentoRepo
      .createQueryBuilder('orcamento')
      .leftJoinAndSelect('orcamento.cliente', 'cliente')
      .leftJoinAndSelect('orcamento.vendedor', 'vendedor')
      .where('orcamento.empresaId = :empresaId', { empresaId });

    if (filtros?.status && filtros.status !== 'todos') {
      query.andWhere('orcamento.status = :status', { status: filtros.status });
    }

    if (filtros?.search) {
      const termo = `%${filtros.search.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(orcamento.numero) LIKE :termo OR LOWER(orcamento.status) LIKE :termo OR LOWER(COALESCE(cliente.nome, \'\')) LIKE :termo)',
        { termo },
      );
    }

    return query.orderBy('orcamento.createdAt', 'DESC').getMany();
  }

  async buscarPorId(id: number, empresaId: string): Promise<Orcamento> {
    const orcamento = await this.orcamentoRepo.findOne({
      where: { id, empresaId },
      relations: ['cliente', 'vendedor'],
    });

    if (!orcamento) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    return orcamento;
  }

  async criar(empresaId: string, data: Partial<Orcamento>): Promise<Orcamento> {
    const orcamento = this.orcamentoRepo.create({ ...data, empresaId });
    return this.orcamentoRepo.save(orcamento);
  }

  async atualizar(id: number, empresaId: string, data: Partial<Orcamento>): Promise<Orcamento> {
    await this.ensureOrcamento(id, empresaId);
    await this.orcamentoRepo.update({ id, empresaId }, data);
    return this.buscarPorId(id, empresaId);
  }

  async excluir(id: number, empresaId: string): Promise<void> {
    await this.ensureOrcamento(id, empresaId);
    await this.orcamentoRepo.delete({ id, empresaId });
  }

  async converterEmPedido(id: number, empresaId: string): Promise<{ message: string; orcamentoId: number }> {
    const orcamento = await this.ensureOrcamento(id, empresaId);
    return { message: 'Conversão em pedido realizada', orcamentoId: orcamento.id };
  }

  async obterEstatisticas(empresaId: string) {
    const [total, pendentes, aceitos, recusados, totalValorRaw] = await Promise.all([
      this.orcamentoRepo.count({ where: { empresaId } }),
      this.orcamentoRepo.count({ where: { empresaId, status: 'pendente' } }),
      this.orcamentoRepo.count({ where: { empresaId, status: 'aceito' } }),
      this.orcamentoRepo.count({ where: { empresaId, status: 'recusado' } }),
      this.orcamentoRepo
        .createQueryBuilder('orcamento')
        .select('COALESCE(SUM(orcamento.valorTotal), 0)', 'soma')
        .where('orcamento.empresaId = :empresaId', { empresaId })
        .getRawOne<{ soma: string }>(),
    ]);

    const valorTotal = Number(totalValorRaw?.soma ?? 0);
    const taxaConversao = total > 0 ? Number(((aceitos / total) * 100).toFixed(1)) : 0;

    return {
      totalOrcamentos: total,
      orcamentosPendentes: pendentes,
      orcamentosAprovados: aceitos,
      orcamentosRecusados: recusados,
      valorTotal,
      taxaConversao,
    };
  }

  private async ensureOrcamento(id: number, empresaId: string): Promise<Orcamento> {
    const orcamento = await this.orcamentoRepo.findOne({ where: { id, empresaId } });
    if (!orcamento) {
      throw new NotFoundException('Orçamento não encontrado');
    }
    return orcamento;
  }
}
