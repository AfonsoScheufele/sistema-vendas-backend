import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Produto } from '../produtos/produto.entity';

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produto_id' })
  produto!: Produto;

  @Column()
  produtoId!: number;

  @Column({ unique: true })
  numero!: string;

  @Column()
  quantidade!: number;

  @Column()
  quantidadeDisponivel!: number;

  @Column()
  dataFabricacao!: Date;

  @Column()
  dataValidade!: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  precoCusto!: number;

  @Column({ nullable: true })
  fornecedor?: string;

  @Column({ nullable: true })
  observacoes?: string;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}


