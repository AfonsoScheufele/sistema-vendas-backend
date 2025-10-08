import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transportadora } from './transportadora.entity';
import { Expedicao } from './expedicao.entity';

@Injectable()
export class LogisticaService {
  constructor(
    @InjectRepository(Transportadora)
    private transportadoraRepo: Repository<Transportadora>,
    @InjectRepository(Expedicao)
    private expedicaoRepo: Repository<Expedicao>,
  ) {}

  // Gestão de Transportadoras
  async criarTransportadora(createTransportadoraDto: any): Promise<Transportadora> {
    const transportadora = this.transportadoraRepo.create(createTransportadoraDto);
    return await this.transportadoraRepo.save(transportadora) as unknown as Transportadora;
  }

  async listarTransportadoras(): Promise<Transportadora[]> {
    return await this.transportadoraRepo.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async obterTransportadora(id: number): Promise<Transportadora> {
    const transportadora = await this.transportadoraRepo.findOne({ where: { id } });
    
    if (!transportadora) {
      throw new NotFoundException('Transportadora não encontrada');
    }
    
    return transportadora;
  }

  // Gestão de Expedições
  private gerarNumeroExpedicao(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `EXP-${timestamp}-${random}`;
  }

  async criarExpedicao(createExpedicaoDto: any): Promise<Expedicao> {
    const expedicao = this.expedicaoRepo.create({
      ...createExpedicaoDto,
      numero: this.gerarNumeroExpedicao(),
      status: 'preparando',
    });

    return await this.expedicaoRepo.save(expedicao) as unknown as Expedicao;
  }

  async listarExpedicoes(filtros?: any): Promise<Expedicao[]> {
    const query = this.expedicaoRepo.createQueryBuilder('expedicao');

    if (filtros?.status) {
      query.where('expedicao.status = :status', { status: filtros.status });
    }

    if (filtros?.transportadora) {
      query.andWhere('expedicao.transportadora = :transportadora', { transportadora: filtros.transportadora });
    }

    return await query
      .orderBy('expedicao.dataExpedicao', 'DESC')
      .getMany();
  }

  async atualizarStatusExpedicao(id: number, status: Expedicao['status']): Promise<Expedicao> {
    const expedicao = await this.expedicaoRepo.findOne({ where: { id } });
    
    if (!expedicao) {
      throw new NotFoundException('Expedição não encontrada');
    }

    expedicao.status = status;
    
    if (status === 'entregue') {
      expedicao.dataEntrega = new Date();
    }

    return await this.expedicaoRepo.save(expedicao) as unknown as Expedicao;
  }

  async obterResumoLogistica(): Promise<any> {
    const [
      totalExpedicoes,
      expedicoesPreparando,
      expedicoesEnviadas,
      expedicoesEntregues,
      valorTotalFrete
    ] = await Promise.all([
      this.expedicaoRepo.count(),
      this.expedicaoRepo.count({ where: { status: 'preparando' } }),
      this.expedicaoRepo.count({ where: { status: 'enviado' } }),
      this.expedicaoRepo.count({ where: { status: 'entregue' } }),
      this.expedicaoRepo
        .createQueryBuilder('expedicao')
        .select('SUM(expedicao.valorFrete)', 'total')
        .getRawOne()
    ]);

    return {
      totalExpedicoes,
      expedicoesPreparando,
      expedicoesEnviadas,
      expedicoesEntregues,
      valorTotalFrete: Number(valorTotalFrete?.total || 0),
    };
  }
}

