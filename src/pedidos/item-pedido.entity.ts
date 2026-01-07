import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Produto } from '../produtos/produto.entity';

@Entity('item_pedidos')
export class ItemPedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido, pedido => pedido.itens)
  pedido: Pedido;

  @Column()
  pedidoId: number;

  @ManyToOne(() => Produto)
  produto: Produto;

  @Column()
  produtoId: number;

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precoUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  comissao: number;
}



















