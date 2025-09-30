import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ItemPedido } from './item-pedido.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  cliente!: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalComissao!: number;

  @Column({ default: 'pendente' })
  status!: string;

  @OneToMany(() => ItemPedido, item => item.pedido, { cascade: true, eager: true })
  itens!: ItemPedido[];

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}