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

  async listarPedidos(): Promise<Pedido[]> {
    return await this.pedidoRepo.find({
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

  async obterEstatisticas() {
    const total = await this.pedidoRepo.count();
    const pendentes = await this.pedidoRepo.count({ where: { status: 'pendente' } });
    const concluidos = await this.pedidoRepo.count({ where: { status: 'concluido' } });
    const cancelados = await this.pedidoRepo.count({ where: { status: 'cancelado' } });

    return {
      total,
      pendentes,
      concluidos,
      cancelados
    };
  }
}



