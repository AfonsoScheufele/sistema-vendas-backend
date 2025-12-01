import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaFiscalEntity } from './nota-fiscal.entity';
import { SpedEntity } from './sped.entity';
import { ImpostoEntity } from './imposto.entity';

@Injectable()
export class FiscalService {
  constructor(
    @InjectRepository(NotaFiscalEntity)
    private readonly notaFiscalRepo: Repository<NotaFiscalEntity>,
    @InjectRepository(SpedEntity)
    private readonly spedRepo: Repository<SpedEntity>,
    @InjectRepository(ImpostoEntity)
    private readonly impostoRepo: Repository<ImpostoEntity>,
  ) {}

  async listarNotasFiscais(empresaId: string, filtros?: { tipo?: string; status?: string }) {
    const query = this.notaFiscalRepo.createQueryBuilder('nf').where('nf.empresaId = :empresaId', { empresaId });

    if (filtros?.tipo) {
      query.andWhere('nf.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros?.status) {
      query.andWhere('nf.status = :status', { status: filtros.status });
    }

    return query.orderBy('nf.criadoEm', 'DESC').getMany();
  }

  async obterNotaFiscalPorId(id: number, empresaId: string) {
    const nota = await this.notaFiscalRepo.findOne({ where: { id, empresaId } });
    if (!nota) {
      throw new NotFoundException('Nota fiscal não encontrada');
    }
    return nota;
  }

  async criarNotaFiscal(empresaId: string, data: Partial<NotaFiscalEntity>) {
    const nota = this.notaFiscalRepo.create({ ...data, empresaId });
    return this.notaFiscalRepo.save(nota);
  }

  async atualizarNotaFiscal(id: number, empresaId: string, data: Partial<NotaFiscalEntity>) {
    const nota = await this.notaFiscalRepo.findOne({ where: { id, empresaId } });
    if (!nota) {
      throw new NotFoundException('Nota fiscal não encontrada');
    }
    Object.assign(nota, data);
    return this.notaFiscalRepo.save(nota);
  }

  async cancelarNotaFiscal(id: number, empresaId: string) {
    const nota = await this.notaFiscalRepo.findOne({ where: { id, empresaId } });
    if (!nota) {
      throw new NotFoundException('Nota fiscal não encontrada');
    }
    if (nota.status === 'cancelada') {
      throw new Error('Nota fiscal já está cancelada');
    }
    nota.status = 'cancelada';
    return this.notaFiscalRepo.save(nota);
  }

  async obterStatsNotasFiscais(empresaId: string) {
    const total = await this.notaFiscalRepo.count({ where: { empresaId } });
    const autorizadas = await this.notaFiscalRepo.count({ where: { empresaId, status: 'autorizada' } });
    const canceladas = await this.notaFiscalRepo.count({ where: { empresaId, status: 'cancelada' } });
    const valorTotal = await this.notaFiscalRepo
      .createQueryBuilder('nf')
      .select('SUM(nf.valorTotal)', 'total')
      .where('nf.empresaId = :empresaId', { empresaId })
      .andWhere("nf.status = 'autorizada'")
      .getRawOne();

    return {
      total,
      autorizadas,
      canceladas,
      valorTotal: parseFloat(valorTotal?.total || '0'),
    };
  }

  async listarSped(empresaId: string, filtros?: { tipo?: string; competencia?: string }) {
    const query = this.spedRepo.createQueryBuilder('sped').where('sped.empresaId = :empresaId', { empresaId });

    if (filtros?.tipo) {
      query.andWhere('sped.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros?.competencia) {
      query.andWhere('sped.competencia = :competencia', { competencia: filtros.competencia });
    }

    return query.orderBy('sped.criadoEm', 'DESC').getMany();
  }

  async criarSped(empresaId: string, data: Partial<SpedEntity>) {
    const sped = this.spedRepo.create({ ...data, empresaId });
    return this.spedRepo.save(sped);
  }

  async listarImpostos(empresaId: string, filtros?: { tipo?: string }) {
    const query = this.impostoRepo.createQueryBuilder('imposto').where('imposto.empresaId = :empresaId', { empresaId });

    if (filtros?.tipo) {
      query.andWhere('imposto.tipo = :tipo', { tipo: filtros.tipo });
    }

    return query.orderBy('imposto.descricao', 'ASC').getMany();
  }

  async criarImposto(empresaId: string, data: Partial<ImpostoEntity>) {
    const imposto = this.impostoRepo.create({ ...data, empresaId });
    return this.impostoRepo.save(imposto);
  }

  async atualizarImposto(id: number, empresaId: string, data: Partial<ImpostoEntity>) {
    const imposto = await this.impostoRepo.findOne({ where: { id, empresaId } });
    if (!imposto) {
      throw new NotFoundException('Imposto não encontrado');
    }
    Object.assign(imposto, data);
    return this.impostoRepo.save(imposto);
  }
}

