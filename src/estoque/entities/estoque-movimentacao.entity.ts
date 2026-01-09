import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Produto } from '../../produtos/produto.entity';
import { EstoqueDepositoEntity } from './estoque-deposito.entity';

@Entity('estoque_movimentacoes')
export class EstoqueMovimentacaoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  empresaId: string;

  @ManyToOne(() => Produto, { eager: true })
  @JoinColumn({ name: 'produto_id' })
  produto: Produto;

  @Column({ name: 'produto_id' })
  produtoId: number;

  @ManyToOne(() => EstoqueDepositoEntity, (deposito) => deposito.movimentacoesOrigem, {
    nullable: true,
  })
  @JoinColumn({ name: 'deposito_origem_id' })
  depositoOrigem?: EstoqueDepositoEntity | null;

  @Column({ name: 'deposito_origem_id', nullable: true })
  depositoOrigemId?: string | null;

  @ManyToOne(() => EstoqueDepositoEntity, (deposito) => deposito.movimentacoesDestino, {
    nullable: true,
  })
  @JoinColumn({ name: 'deposito_destino_id' })
  depositoDestino?: EstoqueDepositoEntity | null;

  @Column({ name: 'deposito_destino_id', nullable: true })
  depositoDestinoId?: string | null;

  @Column({ length: 40 })
  tipo: 'entrada' | 'saida' | 'transferencia' | 'ajuste';

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  custoUnitario?: number | null;

  @Column({ type: 'text', nullable: true })
  observacao?: string | null;

  @Column({ length: 80, nullable: true })
  referencia?: string | null;

  @Column({ type: 'int', nullable: true })
  notaFiscalId?: number | null;

  @CreateDateColumn()
  criadoEm: Date;
}


