import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CotacaoEntity } from './cotacao.entity';
import { RequisicaoEntity } from './requisicao.entity';
import { PedidoCompraEntity } from './pedido-compra.entity';

@Injectable()
export class ComprasAvancadasService {
  constructor(
    @InjectRepository(CotacaoEntity)
    private readonly cotacaoRepo: Repository<CotacaoEntity>,
    @InjectRepository(RequisicaoEntity)
    private readonly requisicaoRepo: Repository<RequisicaoEntity>,
    @InjectRepository(PedidoCompraEntity)
    private readonly pedidoCompraRepo: Repository<PedidoCompraEntity>,
  ) {}

  async listarCotacoes(empresaId: string, filtros?: { status?: string }) {
    const query = this.cotacaoRepo
      .createQueryBuilder('cot')
      .where('cot.empresaId = :empresaId', { empresaId });

    if (filtros?.status) {
      query.andWhere('cot.status = :status', { status: filtros.status });
    }

    return query.orderBy('cot.criadoEm', 'DESC').getMany();
  }

  async criarCotacao(empresaId: string, data: Partial<CotacaoEntity>) {
    const cotacao = this.cotacaoRepo.create({ ...data, empresaId });
    return this.cotacaoRepo.save(cotacao);
  }

  async obterStatsCotacoes(empresaId: string) {
    const total = await this.cotacaoRepo.count({ where: { empresaId } });
    const abertas = await this.cotacaoRepo.count({ where: { empresaId, status: 'aberta' } });
    const fechadas = await this.cotacaoRepo.count({ where: { empresaId, status: 'fechada' } });
    const canceladas = await this.cotacaoRepo.count({ where: { empresaId, status: 'cancelada' } });
    return { total, abertas, fechadas, canceladas };
  }

  async listarRequisicoes(empresaId: string, filtros?: { status?: string }) {
    const query = this.requisicaoRepo
      .createQueryBuilder('req')
      .where('req.empresaId = :empresaId', { empresaId });

    if (filtros?.status) {
      query.andWhere('req.status = :status', { status: filtros.status });
    }

    return query.orderBy('req.criadoEm', 'DESC').getMany();
  }

  async criarRequisicao(empresaId: string, data: Partial<RequisicaoEntity>) {
    const requisicao = this.requisicaoRepo.create({ ...data, empresaId });
    return this.requisicaoRepo.save(requisicao);
  }

  async atualizarRequisicao(id: number, empresaId: string, data: Partial<RequisicaoEntity>) {
    const requisicao = await this.requisicaoRepo.findOne({ where: { id, empresaId } });
    if (!requisicao) {
      throw new NotFoundException('Requisição não encontrada');
    }
    Object.assign(requisicao, data);
    return this.requisicaoRepo.save(requisicao);
  }

  async obterStatsRequisicoes(empresaId: string) {
    const total = await this.requisicaoRepo.count({ where: { empresaId } });
    const pendentes = await this.requisicaoRepo.count({ where: { empresaId, status: 'pendente' } });
    const aprovadas = await this.requisicaoRepo.count({ where: { empresaId, status: 'aprovada' } });
    const rejeitadas = await this.requisicaoRepo.count({ where: { empresaId, status: 'rejeitada' } });
    const valorTotal = await this.requisicaoRepo
      .createQueryBuilder('req')
      .select('SUM(req.valorTotal)', 'total')
      .where('req.empresaId = :empresaId', { empresaId })
      .andWhere("req.status = 'aprovada'")
      .getRawOne();

    return {
      total,
      pendentes,
      aprovadas,
      rejeitadas,
      valorTotal: parseFloat(valorTotal?.total || '0'),
    };
  }

  async listarPedidosCompra(empresaId: string, filtros?: { status?: string }) {
    const query = this.pedidoCompraRepo
      .createQueryBuilder('ped')
      .where('ped.empresaId = :empresaId', { empresaId });

    if (filtros?.status) {
      query.andWhere('ped.status = :status', { status: filtros.status });
    }

    return query.orderBy('ped.criadoEm', 'DESC').getMany();
  }

  async criarPedidoCompra(empresaId: string, data: Partial<PedidoCompraEntity>) {
    const pedido = this.pedidoCompraRepo.create({ ...data, empresaId });
    return this.pedidoCompraRepo.save(pedido);
  }

  async atualizarPedidoCompra(id: number, empresaId: string, data: Partial<PedidoCompraEntity>) {
    const pedido = await this.pedidoCompraRepo.findOne({ where: { id, empresaId } });
    if (!pedido) {
      throw new NotFoundException('Pedido de compra não encontrado');
    }
    Object.assign(pedido, data);
    return this.pedidoCompraRepo.save(pedido);
  }

  async obterStatsPedidosCompra(empresaId: string) {
    const total = await this.pedidoCompraRepo.count({ where: { empresaId } });
    const rascunho = await this.pedidoCompraRepo.count({ where: { empresaId, status: 'rascunho' } });
    const enviado = await this.pedidoCompraRepo.count({ where: { empresaId, status: 'enviado' } });
    const confirmado = await this.pedidoCompraRepo.count({ where: { empresaId, status: 'confirmado' } });
    const recebido = await this.pedidoCompraRepo.count({ where: { empresaId, status: 'recebido' } });
    const cancelado = await this.pedidoCompraRepo.count({ where: { empresaId, status: 'cancelado' } });
    return { total, rascunho, enviado, confirmado, recebido, cancelado };
  }
}

