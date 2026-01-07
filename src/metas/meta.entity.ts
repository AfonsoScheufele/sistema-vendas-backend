import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { MetaProgressoEntity } from './meta-progresso.entity';
import { GrupoVendedores } from './grupo-vendedores.entity';

export type MetaTipo =
  | 'faturamento'
  | 'vendas'
  | 'novos_clientes'
  | 'tickets_medio'
  | 'atividades'
  | 'customizada';

export type MetaStatus = 'ativa' | 'atingida' | 'atrasada' | 'cancelada';

@Entity('metas')
export class MetaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  empresaId: string;

  @Column({ length: 140 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string | null;

  @Column({ type: 'varchar', length: 40 })
  tipo: MetaTipo;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valorObjetivo: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  valorAtual: number;

  @Column({ type: 'int', default: 0 })
  progressoPercentual: number;

  @Column({ type: 'varchar', length: 32, default: 'ativa' })
  status: MetaStatus;

  @Column({ type: 'date' })
  periodoInicio: Date;

  @Column({ type: 'date' })
  periodoFim: Date;

  @Column({ type: 'int', nullable: true })
  responsavelId?: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  responsavelNome?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[] | null;

  @Column({ type: 'int', nullable: true })
  grupoVendedoresId?: number | null;

  @ManyToOne(() => GrupoVendedores, (grupo) => grupo.metas, { nullable: true })
  @JoinColumn({ name: 'grupoVendedoresId' })
  grupoVendedores?: GrupoVendedores | null;

  @OneToMany(() => MetaProgressoEntity, (registro) => registro.meta, {
    cascade: true,
  })
  progresso: MetaProgressoEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


