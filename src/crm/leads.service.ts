import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
  ) {}

  async create(createLeadDto: any): Promise<Lead> {
    const lead = this.leadRepo.create({
      ...createLeadDto,
      score: 0,
      status: 'novo',
    });

    return await this.leadRepo.save(lead) as unknown as Lead;
  }

  async findAll(filtros?: { status?: string; origem?: string }): Promise<Lead[]> {
    const query = this.leadRepo.createQueryBuilder('lead');

    if (filtros?.status) {
      query.where('lead.status = :status', { status: filtros.status });
    }

    if (filtros?.origem) {
      query.andWhere('lead.origem = :origem', { origem: filtros.origem });
    }

    return await query
      .orderBy('lead.dataCriacao', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Lead> {
    const lead = await this.leadRepo.findOne({ where: { id } });
    
    if (!lead) {
      throw new NotFoundException(`Lead com ID ${id} não encontrado`);
    }
    
    return lead;
  }

  async update(id: number, updateLeadDto: any): Promise<Lead> {
    const lead = await this.findOne(id);
    Object.assign(lead, updateLeadDto);
    return await this.leadRepo.save(lead) as unknown as Lead;
  }

  async remove(id: number): Promise<{ message: string }> {
    const lead = await this.findOne(id);
    await this.leadRepo.remove(lead);
    return { message: 'Lead removido com sucesso' };
  }

  async atualizarStatus(id: number, status: Lead['status']): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.status = status;
    lead.ultimoContato = new Date();
    return await this.leadRepo.save(lead) as unknown as Lead;
  }

  async obterStats(): Promise<any> {
    const [
      total,
      novos,
      qualificados,
      convertidos
    ] = await Promise.all([
      this.leadRepo.count(),
      this.leadRepo.count({ where: { status: 'novo' } }),
      this.leadRepo.count({ where: { status: 'qualificado' } }),
      this.leadRepo.count({ where: { status: 'convertido' } })
    ]);

    const taxaConversao = total > 0 ? (convertidos / total) * 100 : 0;

    return {
      total,
      novos,
      qualificados,
      convertidos,
      taxaConversao: Number(taxaConversao.toFixed(2)),
    };
  }
}
