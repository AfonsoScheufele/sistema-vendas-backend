import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { ItemVenda } from './item-venda.entity';

@Entity('vendas')
export class Venda {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data!: Date;

  @OneToMany(() => ItemVenda, (item) => item.venda, { cascade: true })
  itens!: ItemVenda[];

  @Column('decimal', { default: 0 })
  total!: number;
}
