import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Produto } from '../produtos/produto.entity';

@Entity('itens_pedido')
export class ItemPedido {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  pedidoId!: number;

  @Column()
  produtoId!: number;

  @Column()
  produtoNome!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precoUnitario!: number;

  @Column('int')
  quantidade!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  comissao!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  valorComissao!: number;

  @ManyToOne(() => Pedido, pedido => pedido.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedidoId' })
  pedido!: Pedido;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produtoId' })
  produto!: Produto;
}