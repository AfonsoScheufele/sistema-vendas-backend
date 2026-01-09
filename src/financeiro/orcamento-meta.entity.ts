import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../common/transformers/decimal.transformer';
import { OrcamentoCentroCustoEntity } from './orcamento-centro.entity';

@Entity('financeiro_orcamento_metas')
export class OrcamentoMetaMensal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'empresa_id', type: 'varchar', length: 64 })
  empresaId!: string;

  @Column({ name: 'centro_id', type: 'uuid' })
  centroId!: string;

  @ManyToOne(() => OrcamentoCentroCustoEntity, (centro) => centro.metas, {
    onDelete: 'CASCADE',
  })
  centro!: OrcamentoCentroCustoEntity;

  @Column({ type: 'varchar', length: 7 })
  mes!: string; 

  @Column({ type: 'numeric', precision: 14, scale: 2, transformer: decimalTransformer })
  meta!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, transformer: decimalTransformer, default: 0 })
  realizado!: number;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}

