import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Orcamento } from './orcamento.entity';
import { Produto } from '../produtos/produto.entity';

@Entity('itens_orcamento')
export class ItemOrcamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orcamentoId!: number;

  @Column()
  produtoId!: number;

  @Column()
  produtoNome!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precoUnitario!: number;

  @Column('int')
  quantidade!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Orcamento, orcamento => orcamento.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orcamentoId' })
  orcamento!: Orcamento;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produtoId' })
  produto!: Produto;
}