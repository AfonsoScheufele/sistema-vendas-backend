import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../common/transformers/decimal.transformer';
import { OrcamentoMetaMensal } from './orcamento-meta.entity';
import { OrcamentoAlertaEntity } from './orcamento-alerta.entity';

export type OrcamentoTipoLinha = 'receita' | 'despesa';
export type OrcamentoPeriodo = 'mensal' | 'trimestral' | 'anual';

@Entity('financeiro_orcamento_centros')
export class OrcamentoCentroCustoEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'empresa_id', type: 'varchar', length: 64 })
  empresaId!: string;

  @Column({ name: 'centro_custo', type: 'varchar', length: 180 })
  centroCusto!: string;

  @Column({ type: 'varchar', length: 180 })
  categoria!: string;

  @Column({ type: 'varchar', length: 16 })
  tipo!: OrcamentoTipoLinha;

  @Column({ type: 'varchar', length: 16, default: 'mensal' })
  periodo!: OrcamentoPeriodo;

  @Column({ name: 'meta_anual', type: 'numeric', precision: 14, scale: 2, transformer: decimalTransformer })
  metaAnual!: number;

  @Column({
    name: 'realizado_anual',
    type: 'numeric',
    precision: 14,
    scale: 2,
    transformer: decimalTransformer,
    default: 0,
  })
  realizadoAnual!: number;

  @Column({
    name: 'variacao_percentual',
    type: 'numeric',
    precision: 8,
    scale: 2,
    transformer: decimalTransformer,
    default: 0,
  })
  variacaoPercentual!: number;

  @OneToMany(() => OrcamentoMetaMensal, (meta) => meta.centro, { cascade: true })
  metas?: OrcamentoMetaMensal[];

  @OneToMany(() => OrcamentoAlertaEntity, (alerta) => alerta.centro, { cascade: true })
  alertas?: OrcamentoAlertaEntity[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}

