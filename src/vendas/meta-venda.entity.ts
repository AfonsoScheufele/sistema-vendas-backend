import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';

@Entity('metas_vendas')
export class MetaVenda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'vendedor_id' })
  vendedor?: Usuario;

  @Column({ name: 'vendedor_id', nullable: true })
  vendedorId?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorMeta: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorAlcancado: number;

  @Column({ type: 'int', default: 0 })
  quantidadeMeta: number;

  @Column({ type: 'int', default: 0 })
  quantidadeAlcancada: number;

  @Column({ type: 'date' })
  dataInicio: Date;

  @Column({ type: 'date' })
  dataFim: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'mensal'
  })
  periodo: 'mensal' | 'trimestral' | 'semestral' | 'anual';

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ativa'
  })
  status: 'ativa' | 'concluida' | 'cancelada';

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
