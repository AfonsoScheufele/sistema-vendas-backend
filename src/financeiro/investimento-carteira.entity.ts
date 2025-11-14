import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../common/transformers/decimal.transformer';
import { InvestimentoAtivo } from './investimento-ativo.entity';
import { InvestimentoHistorico } from './investimento-historico.entity';
import { InvestimentoAlerta } from './investimento-alerta.entity';

export type InvestimentoRisco = 'baixo' | 'medio' | 'alto';

@Entity('financeiro_investimento_carteiras')
export class InvestimentoCarteira {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 180 })
  nome!: string;

  @Column({ type: 'text', nullable: true })
  objetivo?: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
  saldoAplicado!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
  saldoAtual!: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0, transformer: decimalTransformer })
  rentabilidadeMensal!: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0, transformer: decimalTransformer })
  rentabilidade12m!: number;

  @Column({ type: 'varchar', length: 10, default: 'medio' })
  risco!: InvestimentoRisco;

  @Column({ name: 'empresa_id', type: 'varchar', length: 64 })
  empresaId!: string;

  @OneToMany(() => InvestimentoAtivo, (ativo) => ativo.carteira, { cascade: false })
  ativos?: InvestimentoAtivo[];

  @OneToMany(() => InvestimentoHistorico, (historico) => historico.carteira, { cascade: false })
  historico?: InvestimentoHistorico[];

  @OneToMany(() => InvestimentoAlerta, (alerta) => alerta.carteira, { cascade: false })
  alertas?: InvestimentoAlerta[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}
