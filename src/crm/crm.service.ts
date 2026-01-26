import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { Oportunidade } from './oportunidade.entity';
import { Campanha } from './campanha.entity';
import { CampanhaEmail } from './campanha-email.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(Oportunidade)
    private oportunidadeRepo: Repository<Oportunidade>,
    @InjectRepository(Campanha)
    private campanhaRepo: Repository<Campanha>,
    @InjectRepository(CampanhaEmail)
    private campanhaEmailRepo: Repository<CampanhaEmail>,
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

  async buscarLeadPorId(id: number, empresaId: string): Promise<Lead> {
    const lead = await this.leadRepo.findOne({ where: { id, empresaId } });
    if (!lead) {
      throw new NotFoundException(`Lead com ID ${id} não encontrado`);
    }
    return lead;
  }

  async criarLead(createLeadDto: CreateLeadDto, empresaId: string): Promise<Lead> {
    const lead = this.leadRepo.create({
      ...createLeadDto,
      empresaId,
      status: createLeadDto.status || 'novo',
      score: createLeadDto.score || 0,
    });
    return await this.leadRepo.save(lead);
  }

  async atualizarLead(id: number, updateLeadDto: UpdateLeadDto, empresaId: string): Promise<Lead> {
    const lead = await this.buscarLeadPorId(id, empresaId);
    Object.assign(lead, updateLeadDto);
    return await this.leadRepo.save(lead);
  }

  async atualizarStatusLead(id: number, status: string, empresaId: string): Promise<Lead> {
    const lead = await this.buscarLeadPorId(id, empresaId);
    lead.status = status;
    return await this.leadRepo.save(lead);
  }

  async excluirLead(id: number, empresaId: string): Promise<void> {
    const lead = await this.buscarLeadPorId(id, empresaId);
    await this.leadRepo.remove(lead);
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

  async listarCampanhasEmail(empresaId: string) {
    return await this.campanhaEmailRepo.find({
      where: { empresaId },
      order: { createdAt: 'DESC' },
    });
  }

  async buscarCampanhaEmailPorId(id: number, empresaId: string): Promise<CampanhaEmail> {
    const campanha = await this.campanhaEmailRepo.findOne({ where: { id, empresaId } });
    if (!campanha) {
      throw new NotFoundException(`Campanha de email com ID ${id} não encontrada`);
    }
    return campanha;
  }

  async criarCampanhaEmail(data: Partial<CampanhaEmail>, empresaId: string): Promise<CampanhaEmail> {
    const campanha = this.campanhaEmailRepo.create({
      ...data,
      empresaId,
      status: data.status || 'rascunho',
      destinatarios: data.destinatarios || 0,
      enviados: data.enviados || 0,
      abertos: data.abertos || 0,
      cliques: data.cliques || 0,
    });
    return await this.campanhaEmailRepo.save(campanha);
  }

  async atualizarCampanhaEmail(id: number, data: Partial<CampanhaEmail>, empresaId: string): Promise<CampanhaEmail> {
    const campanha = await this.buscarCampanhaEmailPorId(id, empresaId);
    Object.assign(campanha, data);
    return await this.campanhaEmailRepo.save(campanha);
  }

  async excluirCampanhaEmail(id: number, empresaId: string): Promise<void> {
    const campanha = await this.buscarCampanhaEmailPorId(id, empresaId);
    await this.campanhaEmailRepo.remove(campanha);
  }
}








