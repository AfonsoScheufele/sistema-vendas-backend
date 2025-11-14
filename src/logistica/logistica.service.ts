import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpedicaoEntity } from './expedicao.entity';
import { TransportadoraEntity } from './transportadora.entity';
import { RoteiroEntity } from './roteiro.entity';

@Injectable()
export class LogisticaService {
  constructor(
    @InjectRepository(ExpedicaoEntity)
    private readonly expedicaoRepo: Repository<ExpedicaoEntity>,
    @InjectRepository(TransportadoraEntity)
    private readonly transportadoraRepo: Repository<TransportadoraEntity>,
    @InjectRepository(RoteiroEntity)
    private readonly roteiroRepo: Repository<RoteiroEntity>,
  ) {}

  // Expedições
  async listarExpedicoes(empresaId: string, filtros?: { status?: string }) {
    const query = this.expedicaoRepo
      .createQueryBuilder('exp')
      .where('exp.empresaId = :empresaId', { empresaId });

    if (filtros?.status) {
      query.andWhere('exp.status = :status', { status: filtros.status });
    }

    return query.orderBy('exp.criadoEm', 'DESC').getMany();
  }

  async obterExpedicaoPorId(id: number, empresaId: string) {
    const expedicao = await this.expedicaoRepo.findOne({ where: { id, empresaId } });
    if (!expedicao) {
      throw new NotFoundException('Expedição não encontrada');
    }
    return expedicao;
  }

  async criarExpedicao(empresaId: string, data: Partial<ExpedicaoEntity>) {
    const expedicao = this.expedicaoRepo.create({ ...data, empresaId });
    return this.expedicaoRepo.save(expedicao);
  }

  async atualizarExpedicao(id: number, empresaId: string, data: Partial<ExpedicaoEntity>) {
    const expedicao = await this.expedicaoRepo.findOne({ where: { id, empresaId } });
    if (!expedicao) {
      throw new NotFoundException('Expedição não encontrada');
    }
    Object.assign(expedicao, data);
    return this.expedicaoRepo.save(expedicao);
  }

  async rastrearExpedicao(codigoRastreamento: string, empresaId: string) {
    const expedicao = await this.expedicaoRepo.findOne({
      where: { codigoRastreamento, empresaId },
    });
    if (!expedicao) {
      throw new NotFoundException('Expedição não encontrada');
    }
    return expedicao;
  }

  // Transportadoras
  async listarTransportadoras(empresaId: string, filtros?: { status?: string }) {
    const query = this.transportadoraRepo
      .createQueryBuilder('trans')
      .where('trans.empresaId = :empresaId', { empresaId });

    if (filtros?.status) {
      query.andWhere('trans.status = :status', { status: filtros.status });
    }

    return query.orderBy('trans.nome', 'ASC').getMany();
  }

  async criarTransportadora(empresaId: string, data: Partial<TransportadoraEntity>) {
    const transportadora = this.transportadoraRepo.create({ ...data, empresaId });
    return this.transportadoraRepo.save(transportadora);
  }

  async atualizarTransportadora(id: number, empresaId: string, data: Partial<TransportadoraEntity>) {
    const transportadora = await this.transportadoraRepo.findOne({ where: { id, empresaId } });
    if (!transportadora) {
      throw new NotFoundException('Transportadora não encontrada');
    }
    Object.assign(transportadora, data);
    return this.transportadoraRepo.save(transportadora);
  }

  // Roteiros
  async listarRoteiros(empresaId: string, filtros?: { status?: string }) {
    const query = this.roteiroRepo.createQueryBuilder('rot').where('rot.empresaId = :empresaId', { empresaId });

    if (filtros?.status) {
      query.andWhere('rot.status = :status', { status: filtros.status });
    }

    return query.orderBy('rot.criadoEm', 'DESC').getMany();
  }

  async criarRoteiro(empresaId: string, data: Partial<RoteiroEntity>) {
    const roteiro = this.roteiroRepo.create({ ...data, empresaId });
    return this.roteiroRepo.save(roteiro);
  }

  async atualizarRoteiro(id: number, empresaId: string, data: Partial<RoteiroEntity>) {
    const roteiro = await this.roteiroRepo.findOne({ where: { id, empresaId } });
    if (!roteiro) {
      throw new NotFoundException('Roteiro não encontrado');
    }
    Object.assign(roteiro, data);
    return this.roteiroRepo.save(roteiro);
  }

  async obterStatsRoteiros(empresaId: string) {
    const total = await this.roteiroRepo.count({ where: { empresaId } });
    const planejados = await this.roteiroRepo.count({ where: { empresaId, status: 'planejado' } });
    const emExecucao = await this.roteiroRepo.count({ where: { empresaId, status: 'em_execucao' } });
    const concluidos = await this.roteiroRepo.count({ where: { empresaId, status: 'concluido' } });
    return { total, planejados, em_execucao: emExecucao, concluidos };
  }
}

