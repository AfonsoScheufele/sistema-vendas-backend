import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Produto } from '../produtos/produto.entity';

@Entity('movimentacoes_estoque')
export class MovimentacaoEstoque {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produto_id' })
  produto!: Produto;

  @Column()
  produtoId!: number;

  @Column({
    type: 'varchar',
    default: 'entrada'
  })
  tipo!: 'entrada' | 'saida' | 'ajuste' | 'transferencia';

  @Column('int')
  quantidade!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  valorUnitario?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  valorTotal?: number;

  @Column()
  motivo!: string;

  @Column({ nullable: true })
  observacoes?: string;

  @Column()
  responsavel!: string;

  @Column({ nullable: true })
  documento?: string;

  @Column({ nullable: true })
  numeroDocumento?: string;

  @CreateDateColumn()
  dataMovimentacao!: Date;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}


