import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { Oportunidade } from './oportunidade.entity';
import { Campanha } from './campanha.entity';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(Oportunidade)
    private oportunidadeRepo: Repository<Oportunidade>,
    @InjectRepository(Campanha)
    private campanhaRepo: Repository<Campanha>,
  ) {}

  async listarLeads() {
    return await this.leadRepo.find({ order: { dataCriacao: 'DESC' } });
  }

  async contarLeadsNaoConvertidos() {
    return await this.leadRepo.count({ where: { status: 'novo' } });
  }

  async listarOportunidades() {
    return await this.oportunidadeRepo.find({ order: { dataCriacao: 'DESC' } });
  }

  async contarOportunidadesAtivas() {
    return await this.oportunidadeRepo.count({ where: { status: 'ativa' } });
  }

  async listarCampanhas() {
    return await this.campanhaRepo.find({ order: { dataInicio: 'DESC' } });
  }

  async contarCampanhasAtivas() {
    return await this.campanhaRepo.count({ where: { status: 'ativa' } });
  }
}


