import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { ItemPedido } from './item-pedido.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: string;

  @ManyToOne(() => Cliente)
  cliente: Cliente;

  @Column()
  clienteId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', length: 20, default: 'pendente' })
  status: string;

  @Column({ type: 'timestamp' })
  dataPedido: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataEntrega: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataEntregaPrevista: Date;

  @Column({ nullable: true })
  observacoes: string;

  @Column({ nullable: true })
  enderecoEntrega: string;

  @Column({ nullable: true })
  transportadora: string;

  @Column({ nullable: true })
  codigoRastreamento: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  desconto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  frete: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  condicaoPagamento: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  formaPagamento: string;

  @Column({ type: 'varchar', length: 20, default: 'pendente' })
  statusPagamento: string;

  @Column({ nullable: true })
  origem: string;

  @OneToMany(() => ItemPedido, item => item.pedido)
  itens: ItemPedido[];

  @ManyToOne(() => Usuario, { nullable: true })
  vendedor: Usuario;

  @Column({ nullable: true })
  vendedorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
