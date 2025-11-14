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

  async listarLeads(empresaId: string) {
    return await this.leadRepo.find({
      where: { empresaId },
      order: { dataCriacao: 'DESC' },
    });
  }

  async contarLeadsNaoConvertidos(empresaId: string) {
    return await this.leadRepo.count({ where: { empresaId, status: 'novo' } });
  }

  async listarOportunidades(empresaId: string) {
    return await this.oportunidadeRepo.find({
      where: { empresaId },
      order: { dataCriacao: 'DESC' },
    });
  }

  async contarOportunidadesAtivas(empresaId: string) {
    return await this.oportunidadeRepo.count({ where: { empresaId, status: 'ativa' } });
  }

  async listarCampanhas(empresaId: string) {
    return await this.campanhaRepo.find({
      where: { empresaId },
      order: { dataInicio: 'DESC' },
    });
  }

  async contarCampanhasAtivas(empresaId: string) {
    return await this.campanhaRepo.count({ where: { empresaId, status: 'ativa' } });
  }
}








