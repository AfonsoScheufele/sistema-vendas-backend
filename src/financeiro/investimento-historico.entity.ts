import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../common/transformers/decimal.transformer';
import { InvestimentoCarteira } from './investimento-carteira.entity';

@Entity('financeiro_investimento_historicos')
export class InvestimentoHistorico {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'empresa_id', type: 'varchar', length: 64 })
  empresaId!: string;

  @Column({ name: 'carteira_id', type: 'uuid', nullable: true })
  carteiraId?: string | null;

  @ManyToOne(() => InvestimentoCarteira, (carteira) => carteira.historico, {
    onDelete: 'SET NULL',
  })
  carteira?: InvestimentoCarteira | null;

  @Column({ type: 'date' })
  data!: string;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0, transformer: decimalTransformer })
  rentabilidade!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true, transformer: decimalTransformer })
  aporte?: number | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true, transformer: decimalTransformer })
  resgate?: number | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}
