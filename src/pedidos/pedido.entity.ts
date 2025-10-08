import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ItemPedido } from './item-pedido.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @Column()
  clienteId!: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'vendedor_id' })
  vendedor?: Usuario;

  @Column({ nullable: true })
  vendedorId?: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  desconto!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalComissao!: number;

  @Column({ default: 'pendente' })
  status!: string;

  @Column({ nullable: true })
  observacoes?: string;

  @Column({ nullable: true })
  formaPagamento?: string;

  @Column({ nullable: true })
  parcelas?: number;

  @Column({ type: 'date', nullable: true })
  dataEntrega?: Date;

  @OneToMany(() => ItemPedido, item => item.pedido, { cascade: true, eager: true })
  itens!: ItemPedido[];

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}