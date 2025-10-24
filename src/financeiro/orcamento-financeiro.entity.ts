import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';

@Entity('orcamentos_financeiros')
export class OrcamentoFinanceiro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorOrcado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorGasto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorRestante: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'despesa'
  })
  tipo: 'receita' | 'despesa';

  @Column({
    type: 'varchar',
    length: 20,
    default: 'operacional'
  })
  categoria: 'operacional' | 'investimento' | 'marketing' | 'pessoal' | 'infraestrutura';

  @Column({ type: 'date' })
  dataInicio: Date;

  @Column({ type: 'date' })
  dataFim: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: Usuario;

  @Column({ name: 'responsavel_id' })
  responsavelId: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ativo'
  })
  status: 'ativo' | 'concluido' | 'cancelado';

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
