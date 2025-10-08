import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requisicao } from './requisicao.entity';

@Injectable()
export class RequisicoesService {
  constructor(
    @InjectRepository(Requisicao)
    private requisicaoRepo: Repository<Requisicao>,
  ) {}

  private gerarNumeroRequisicao(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `REQ-${timestamp}-${random}`;
  }

  async create(createRequisicaoDto: any): Promise<Requisicao> {
    const requisicao = this.requisicaoRepo.create({
      ...createRequisicaoDto,
      numero: this.gerarNumeroRequisicao(),
      status: 'pendente',
    });

    return await this.requisicaoRepo.save(requisicao) as unknown as Requisicao;
  }

  async findAll(filtros?: { status?: string; prioridade?: string }): Promise<Requisicao[]> {
    const query = this.requisicaoRepo.createQueryBuilder('requisicao');

    if (filtros?.status) {
      query.where('requisicao.status = :status', { status: filtros.status });
    }

    if (filtros?.prioridade) {
      query.andWhere('requisicao.prioridade = :prioridade', { prioridade: filtros.prioridade });
    }

    return await query
      .orderBy('requisicao.dataSolicitacao', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Requisicao> {
    const requisicao = await this.requisicaoRepo.findOne({ where: { id } });
    
    if (!requisicao) {
      throw new NotFoundException(`Requisição com ID ${id} não encontrada`);
    }
    
    return requisicao;
  }

  async update(id: number, updateRequisicaoDto: any): Promise<Requisicao> {
    const requisicao = await this.findOne(id);
    Object.assign(requisicao, updateRequisicaoDto);
    return await this.requisicaoRepo.save(requisicao);
  }

  async remove(id: number): Promise<{ message: string }> {
    const requisicao = await this.findOne(id);
    await this.requisicaoRepo.remove(requisicao);
    return { message: 'Requisição removida com sucesso' };
  }

  async aprovar(id: number): Promise<Requisicao> {
    const requisicao = await this.findOne(id);
    requisicao.status = 'aprovada';
    requisicao.dataAprovacao = new Date();
    return await this.requisicaoRepo.save(requisicao);
  }

  async rejeitar(id: number, motivo: string): Promise<Requisicao> {
    const requisicao = await this.findOne(id);
    requisicao.status = 'rejeitada';
    requisicao.observacoes = `${requisicao.observacoes || ''}\nRejeitada em ${new Date().toISOString()}: ${motivo}`.trim();
    return await this.requisicaoRepo.save(requisicao);
  }

  async obterStats(): Promise<any> {
    const [
      total,
      pendentes,
      aprovadas,
      rejeitadas,
      valorTotal
    ] = await Promise.all([
      this.requisicaoRepo.count(),
      this.requisicaoRepo.count({ where: { status: 'pendente' } }),
      this.requisicaoRepo.count({ where: { status: 'aprovada' } }),
      this.requisicaoRepo.count({ where: { status: 'rejeitada' } }),
      this.requisicaoRepo
        .createQueryBuilder('requisicao')
        .select('SUM(requisicao.valorEstimado)', 'total')
        .getRawOne()
    ]);

    return {
      total,
      pendentes,
      aprovadas,
      rejeitadas,
      valorTotal: Number(valorTotal?.total || 0),
    };
  }
}
