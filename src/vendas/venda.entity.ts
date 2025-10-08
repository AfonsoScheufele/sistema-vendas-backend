import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { ItemVenda } from './item-venda.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('vendas')
export class Venda {
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

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  data!: Date;

  @Column({ default: 'pendente' })
  status!: string;

  @OneToMany(() => ItemVenda, (item) => item.venda, { cascade: true })
  itens!: ItemVenda[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  desconto!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  comissao!: number;

  @Column({ nullable: true })
  observacoes?: string;

  @Column({ nullable: true })
  formaPagamento?: string;

  @Column({ nullable: true })
  parcelas?: number;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}
