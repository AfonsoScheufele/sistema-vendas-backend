import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InvestimentoCarteira } from './investimento-carteira.entity';

export type InvestimentoAlertaImpacto = 'baixo' | 'medio' | 'alto';

@Entity('financeiro_investimento_alertas')
export class InvestimentoAlerta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'empresa_id', type: 'varchar', length: 64 })
  empresaId!: string;

  @Column({ name: 'carteira_id', type: 'uuid', nullable: true })
  carteiraId?: string | null;

  @ManyToOne(() => InvestimentoCarteira, (carteira) => carteira.alertas, {
    onDelete: 'SET NULL',
  })
  carteira?: InvestimentoCarteira | null;

  @Column({ type: 'text' })
  recomendacao!: string;

  @Column({ type: 'varchar', length: 10, default: 'medio' })
  impacto!: InvestimentoAlertaImpacto;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}
