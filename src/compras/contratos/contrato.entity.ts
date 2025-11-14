import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('contratos')
export class ContratoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  @Index()
  empresaId: string;

  @Column({ length: 50 })
  numero: string;

  @Column({ length: 160 })
  fornecedor: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  valor: number;

  @Column({ type: 'date' })
  dataInicio: Date;

  @Column({ type: 'date' })
  dataFim: Date;

  @Column({ length: 20 })
  status: string;

  @Column({ length: 20 })
  tipo: string;

  @Column({ length: 120 })
  responsavel: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}


