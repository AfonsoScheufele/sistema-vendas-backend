import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Oportunidade } from './oportunidade.entity';

@Injectable()
export class OportunidadesService {
  constructor(
    @InjectRepository(Oportunidade)
    private oportunidadeRepo: Repository<Oportunidade>,
  ) {}

  async create(createOportunidadeDto: any): Promise<Oportunidade> {
    const oportunidade = this.oportunidadeRepo.create({
      ...createOportunidadeDto,
      atividades: [],
    });

    return await this.oportunidadeRepo.save(oportunidade) as unknown as Oportunidade;
  }

  async findAll(status?: string): Promise<Oportunidade[]> {
    const query = this.oportunidadeRepo.createQueryBuilder('oportunidade');

    if (status) {
      query.where('oportunidade.status = :status', { status });
    }

    return await query
      .orderBy('oportunidade.dataCriacao', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Oportunidade> {
    const oportunidade = await this.oportunidadeRepo.findOne({ where: { id } });
    
    if (!oportunidade) {
      throw new NotFoundException(`Oportunidade com ID ${id} não encontrada`);
    }
    
    return oportunidade;
  }

  async update(id: number, updateOportunidadeDto: any): Promise<Oportunidade> {
    const oportunidade = await this.findOne(id);
    Object.assign(oportunidade, updateOportunidadeDto);
    return await this.oportunidadeRepo.save(oportunidade) as unknown as Oportunidade;
  }

  async remove(id: number): Promise<{ message: string }> {
    const oportunidade = await this.findOne(id);
    await this.oportunidadeRepo.remove(oportunidade);
    return { message: 'Oportunidade removida com sucesso' };
  }

  async adicionarAtividade(id: number, atividade: any): Promise<Oportunidade> {
    const oportunidade = await this.findOne(id);
    
    if (!oportunidade.atividades) {
      oportunidade.atividades = [];
    }

    oportunidade.atividades.push({
      ...atividade,
      data: new Date(),
    });

    return await this.oportunidadeRepo.save(oportunidade) as unknown as Oportunidade;
  }

  async atualizarFase(id: number, fase: Oportunidade['fase']): Promise<Oportunidade> {
    const oportunidade = await this.findOne(id);
    oportunidade.fase = fase;
    return await this.oportunidadeRepo.save(oportunidade) as unknown as Oportunidade;
  }

  async ganhar(id: number): Promise<Oportunidade> {
    const oportunidade = await this.findOne(id);
    oportunidade.status = 'ganha';
    oportunidade.fase = 'fechamento';
    return await this.oportunidadeRepo.save(oportunidade) as unknown as Oportunidade;
  }

  async perder(id: number, motivo: string): Promise<Oportunidade> {
    const oportunidade = await this.findOne(id);
    oportunidade.status = 'perdida';
    oportunidade.observacoes = `${oportunidade.observacoes || ''}\nPerdida em ${new Date().toISOString()}: ${motivo}`.trim();
    return await this.oportunidadeRepo.save(oportunidade) as unknown as Oportunidade;
  }
}
