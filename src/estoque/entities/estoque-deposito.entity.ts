import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstoqueMovimentacaoEntity } from './estoque-movimentacao.entity';

@Entity('estoque_depositos')
export class EstoqueDepositoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  empresaId: string;

  @Column({ length: 140 })
  nome: string;

  @Column({ length: 180, nullable: true })
  descricao?: string | null;

  @Column({ length: 40 })
  tipo: 'principal' | 'filial' | 'externo';

  @Column({ type: 'jsonb', nullable: true })
  endereco?: Record<string, any> | null;

  @Column({ length: 40 })
  status: 'ativo' | 'inativo';

  @Column({ type: 'int', default: 0 })
  capacidadeTotal?: number;

  @OneToMany(() => EstoqueMovimentacaoEntity, (mov) => mov.depositoOrigem)
  movimentacoesOrigem: EstoqueMovimentacaoEntity[];

  @OneToMany(() => EstoqueMovimentacaoEntity, (mov) => mov.depositoDestino)
  movimentacoesDestino: EstoqueMovimentacaoEntity[];

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}


