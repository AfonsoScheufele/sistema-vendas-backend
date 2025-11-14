import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrcamentoCentroCustoEntity } from './orcamento-centro.entity';

export type OrcamentoAlertaImpacto = 'baixo' | 'medio' | 'alto';

@Entity('financeiro_orcamento_alertas')
export class OrcamentoAlertaEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'empresa_id', type: 'varchar', length: 64 })
  empresaId!: string;

  @Column({ name: 'centro_id', type: 'uuid', nullable: true })
  centroId?: string | null;

  @ManyToOne(() => OrcamentoCentroCustoEntity, (centro) => centro.alertas, {
    onDelete: 'SET NULL',
  })
  centro?: OrcamentoCentroCustoEntity | null;

  @Column({ type: 'varchar', length: 180 })
  centroCusto!: string;

  @Column({ type: 'varchar', length: 180 })
  categoria!: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  variacaoPercentual!: number;

  @Column({ type: 'text' })
  mensagem!: string;

  @Column({ type: 'varchar', length: 10, default: 'medio' })
  impacto!: OrcamentoAlertaImpacto;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}

