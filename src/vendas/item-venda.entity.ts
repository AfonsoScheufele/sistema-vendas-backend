import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Venda } from './venda.entity';
import { Produto } from '../produtos/produto.entity';

@Entity('itens_venda')
export class ItemVenda {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Venda, (venda) => venda.itens)
  @JoinColumn({ name: 'venda_id' })
  venda!: Venda;

  @Column()
  vendaId!: number;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produto_id' })
  produto!: Produto;

  @Column()
  produtoId!: number;

  @Column('int')
  quantidade!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  preco_unitario!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  preco_total!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  desconto!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  comissao!: number;
}
