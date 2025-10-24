import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';
import { Venda } from './venda.entity';

@Entity('comissoes')
export class Comissao {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'vendedor_id' })
  vendedor: Usuario;

  @Column({ name: 'vendedor_id' })
  vendedorId: number;

  @ManyToOne(() => Venda)
  @JoinColumn({ name: 'venda_id' })
  venda: Venda;

  @Column({ name: 'venda_id' })
  vendaId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorVenda: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentualComissao: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorComissao: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pendente'
  })
  status: 'pendente' | 'paga' | 'cancelada';

  @Column({ type: 'timestamp', nullable: true })
  dataPagamento?: Date;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
