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

  @Column({ nullable: true })
  observacoes: string;

  @OneToMany(() => ItemPedido, item => item.pedido)
  itens: ItemPedido[];

  @ManyToOne(() => Usuario)
  vendedor: Usuario;

  @Column()
  vendedorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


