import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servico } from './servico.entity';
import { CreateServicoDto } from './dto/create-servico.dto';

@Injectable()
export class ServicosService {
  constructor(
    @InjectRepository(Servico)
    private servicoRepo: Repository<Servico>,
  ) {}

  async create(createServicoDto: CreateServicoDto, empresaId: string): Promise<Servico> {
    const servico = this.servicoRepo.create({
      ...createServicoDto,
      empresaId,
    });
    return this.servicoRepo.save(servico);
  }

  async findAll(empresaId: string): Promise<Servico[]> {
    return this.servicoRepo.find({
      where: { empresaId },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number, empresaId: string): Promise<Servico> {
    const servico = await this.servicoRepo.findOne({
      where: { id, empresaId },
    });
    if (!servico) {
      throw new NotFoundException(`Serviço #${id} não encontrado`);
    }
    return servico;
  }

  async update(id: number, updateServicoDto: CreateServicoDto, empresaId: string): Promise<Servico> {
    const servico = await this.findOne(id, empresaId);
    this.servicoRepo.merge(servico, updateServicoDto);
    return this.servicoRepo.save(servico);
  }

  async remove(id: number, empresaId: string): Promise<void> {
    const servico = await this.findOne(id, empresaId);
    await this.servicoRepo.remove(servico);
  }
}
