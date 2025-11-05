import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './pedido.entity';
import { ItemPedido } from './item-pedido.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepo: Repository<Pedido>,
    @InjectRepository(ItemPedido)
    private itemPedidoRepo: Repository<ItemPedido>,
  ) {}

  async listarPedidos(status?: string): Promise<Pedido[]> {
    const where = status ? { status } : {};
    return await this.pedidoRepo.find({
      where,
      relations: ['cliente', 'vendedor', 'itens', 'itens.produto'],
      order: { dataPedido: 'DESC' }
    });
  }

  async obterPedido(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
      relations: ['cliente', 'vendedor', 'itens', 'itens.produto']
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return pedido;
  }

  async criar(data: Partial<Pedido>): Promise<Pedido> {
    const pedido = this.pedidoRepo.create(data);
    return await this.pedidoRepo.save(pedido);
  }

  async atualizar(id: number, data: Partial<Pedido>): Promise<Pedido> {
    await this.pedidoRepo.update(id, data);
    return await this.obterPedido(id);
  }

  async excluir(id: number): Promise<void> {
    const result = await this.pedidoRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Pedido não encontrado');
    }
  }

  async obterEstatisticas() {
    const total = await this.pedidoRepo.count();
    const pendentes = await this.pedidoRepo.count({ where: { status: 'pendente' } });
    const concluidos = await this.pedidoRepo.count({ where: { status: 'concluido' } });
    const cancelados = await this.pedidoRepo.count({ where: { status: 'cancelado' } });

    return {
      totalPedidos: total,
      pedidosPendentes: pendentes,
      totalVendas: 0,
      totalComissoes: 0
    };
  }
}
