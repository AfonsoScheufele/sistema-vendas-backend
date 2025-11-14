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

export type InvestimentoClasse =
  | 'renda_fixa'
  | 'renda_variavel'
  | 'caixa'
  | 'fundo_imobiliario'
  | 'internacional';

export type InvestimentoRisco = 'baixo' | 'medio' | 'alto';

@Entity('financeiro_investimento_ativos')
export class InvestimentoAtivo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'carteira_id', type: 'uuid' })
  carteiraId!: string;

  @ManyToOne(() => InvestimentoCarteira, (carteira) => carteira.ativos, {
    onDelete: 'CASCADE',
  })
  carteira!: InvestimentoCarteira;

  @Column({ length: 120 })
  ativo!: string;

  @Column({ type: 'varchar', length: 32 })
  classe!: InvestimentoClasse;

  @Column({ length: 120 })
  instituicao!: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
  valorAplicado!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
  valorAtual!: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0, transformer: decimalTransformer })
  rentabilidade12m!: number;

  @Column({ type: 'varchar', length: 10, default: 'medio' })
  risco!: InvestimentoRisco;

  @Column({ name: 'empresa_id', type: 'varchar', length: 64 })
  empresaId!: string;

  @Column({ name: 'aplicado_em', type: 'date', nullable: true })
  aplicadoEm?: string | null;

  @Column({ name: 'atualizado_em_data', type: 'timestamptz', nullable: true })
  atualizadoEmData?: Date | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}
