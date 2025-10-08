import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Banco } from './banco.entity';

@Entity('movimentacoes_financeiras')
export class MovimentacaoFinanceira {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Banco)
  @JoinColumn({ name: 'banco_id' })
  banco!: Banco;

  @Column()
  bancoId!: number;

  @Column({
    type: 'varchar',
    default: 'receita'
  })
  tipo!: 'receita' | 'despesa' | 'transferencia';

  @Column()
  descricao!: string;

  @Column('decimal', { precision: 15, scale: 2 })
  valor!: number;

  @Column({
    type: 'varchar',
    default: 'dinheiro'
  })
  formaPagamento!: 'dinheiro' | 'pix' | 'transferencia' | 'cheque' | 'cartao';

  @Column({ nullable: true })
  categoria?: string;

  @Column({ nullable: true })
  cliente?: string;

  @Column({ nullable: true })
  fornecedor?: string;

  @Column({ nullable: true })
  documento?: string;

  @Column({ nullable: true })
  numeroDocumento?: string;

  @Column({ nullable: true })
  observacoes?: string;

  @Column()
  responsavel!: string;

  @Column({ nullable: true })
  dataVencimento?: Date;

  @Column({
    type: 'varchar',
    default: 'pendente'
  })
  status!: 'pendente' | 'pago' | 'vencido' | 'cancelado';

  @CreateDateColumn()
  dataMovimentacao!: Date;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}


