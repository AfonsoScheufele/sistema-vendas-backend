import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ItemOrcamento } from './item-orcamento.entity';
import { Cliente } from '../clientes/cliente.entity';

@Entity('orcamentos')
export class Orcamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @Column()
  clienteId!: number;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  telefone?: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  desconto!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total!: number;

  @Column({ default: 'pendente' })
  status!: string;

  @Column({ type: 'date', nullable: true })
  validade?: Date;

  @Column('text', { nullable: true })
  observacoes?: string;

  @OneToMany(() => ItemOrcamento, item => item.orcamento, { cascade: true, eager: true })
  itens!: ItemOrcamento[];

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}