import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmpresaEntity } from '../empresas/empresa.entity';

@Entity('backups')
export class BackupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => EmpresaEntity)
  @JoinColumn({ name: 'empresaId' })
  empresa: EmpresaEntity;

  @Column()
  nome: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'varchar', length: 20 })
  tipo: 'manual' | 'automatico';

  @Column({ type: 'varchar', length: 20 })
  status: 'em_andamento' | 'concluido' | 'falhou';

  @Column({ type: 'text', nullable: true })
  caminhoArquivo: string;

  @Column({ type: 'bigint', nullable: true })
  tamanhoBytes: number;

  @Column({ type: 'jsonb', nullable: true })
  dadosBackup: any;

  @Column({ type: 'text', nullable: true })
  erro: string;

  @CreateDateColumn()
  createdAt: Date;
}


