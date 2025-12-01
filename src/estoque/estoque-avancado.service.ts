import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoteEntity } from './lote.entity';
import { InventarioEntity } from './inventario.entity';

@Injectable()
export class EstoqueAvancadoService {
  constructor(
    @InjectRepository(LoteEntity)
    private readonly loteRepo: Repository<LoteEntity>,
    @InjectRepository(InventarioEntity)
    private readonly inventarioRepo: Repository<InventarioEntity>,
  ) {}

  async listarLotes(empresaId: string, filtros?: { produtoId?: number; depositoId?: string }) {
    const query = this.loteRepo.createQueryBuilder('lote').where('lote.empresaId = :empresaId', { empresaId });

    if (filtros?.produtoId) {
      query.andWhere('lote.produtoId = :produtoId', { produtoId: filtros.produtoId });
    }

    if (filtros?.depositoId) {
      query.andWhere('lote.depositoId = :depositoId', { depositoId: filtros.depositoId });
    }

    return query.orderBy('lote.dataValidade', 'ASC').getMany();
  }

  async criarLote(empresaId: string, data: Partial<LoteEntity>) {
    const lote = this.loteRepo.create({ ...data, empresaId });
    return this.loteRepo.save(lote);
  }

  async atualizarLote(id: number, empresaId: string, data: Partial<LoteEntity>) {
    const lote = await this.loteRepo.findOne({ where: { id, empresaId } });
    if (!lote) {
      throw new NotFoundException('Lote não encontrado');
    }
    Object.assign(lote, data);
    return this.loteRepo.save(lote);
  }

  async obterLotesVencendo(empresaId: string, dias: number = 30) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + dias);

    return this.loteRepo
      .createQueryBuilder('lote')
      .where('lote.empresaId = :empresaId', { empresaId })
      .andWhere('lote.dataValidade <= :dataLimite', { dataLimite })
      .andWhere('lote.quantidadeUtilizada < lote.quantidade')
      .orderBy('lote.dataValidade', 'ASC')
      .getMany();
  }

  async listarInventarios(empresaId: string, filtros?: { status?: string; depositoId?: string }) {
    const query = this.inventarioRepo
      .createQueryBuilder('inv')
      .where('inv.empresaId = :empresaId', { empresaId });

    if (filtros?.status) {
      query.andWhere('inv.status = :status', { status: filtros.status });
    }

    if (filtros?.depositoId) {
      query.andWhere('inv.depositoId = :depositoId', { depositoId: filtros.depositoId });
    }

    return query.orderBy('inv.criadoEm', 'DESC').getMany();
  }

  async criarInventario(empresaId: string, data: Partial<InventarioEntity>) {
    const inventario = this.inventarioRepo.create({ ...data, empresaId });
    return this.inventarioRepo.save(inventario);
  }

  async atualizarInventario(id: number, empresaId: string, data: Partial<InventarioEntity>) {
    const inventario = await this.inventarioRepo.findOne({ where: { id, empresaId } });
    if (!inventario) {
      throw new NotFoundException('Inventário não encontrado');
    }
    Object.assign(inventario, data);
    return this.inventarioRepo.save(inventario);
  }

  async obterStatsInventarios(empresaId: string) {
    const total = await this.inventarioRepo.count({ where: { empresaId } });
    const planejados = await this.inventarioRepo.count({ where: { empresaId, status: 'planejado' } });
    const emAndamento = await this.inventarioRepo.count({ where: { empresaId, status: 'em_andamento' } });
    const concluidos = await this.inventarioRepo.count({ where: { empresaId, status: 'concluido' } });
    return { total, planejados, em_andamento: emAndamento, concluidos };
  }
}

