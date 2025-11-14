import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MetaEntity } from './meta.entity';

@Entity('metas_progresso')
export class MetaProgressoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  empresaId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valorAtual: number;

  @Column({ type: 'int', default: 0 })
  progressoPercentual: number;

  @Column({ type: 'text', nullable: true })
  observacao?: string | null;

  @ManyToOne(() => MetaEntity, (meta) => meta.progresso, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meta_id' })
  meta: MetaEntity;

  @Column({ name: 'meta_id' })
  metaId: string;

  @CreateDateColumn()
  criadoEm: Date;
}


