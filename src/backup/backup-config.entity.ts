import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmpresaEntity } from '../empresas/empresa.entity';

@Entity('backup_configs')
export class BackupConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  empresaId: string;

  @ManyToOne(() => EmpresaEntity)
  @JoinColumn({ name: 'empresaId' })
  empresa: EmpresaEntity;

  @Column({ type: 'boolean', default: true })
  backupAutomatico: boolean;

  @Column({ type: 'varchar', length: 20, default: 'diario' })
  frequencia: 'diario' | 'semanal' | 'mensal';

  @Column({ type: 'time', default: '02:00:00' })
  horario: string;

  @Column({ type: 'int', default: 30 })
  diasRetencao: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


