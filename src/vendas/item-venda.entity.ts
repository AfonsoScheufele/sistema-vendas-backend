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

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produto_id' })
  produto!: Produto;

  @Column('int')
  quantidade!: number;

  @Column('decimal')
  preco_unitario!: number;
}
