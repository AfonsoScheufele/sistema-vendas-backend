import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Pedido } from '../pedidos/pedido.entity';
import { Produto } from '../produtos/produto.entity';

@Entity('devolucoes')
export class Devolucao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id' })
  empresaId: string;

  @Column()
  pedidoId: number;

  @ManyToOne(() => Pedido)
  pedido: Pedido;

  @Column({ type: 'text' })
  motivo: string;

  @Column({ type: 'varchar', length: 20, default: 'pendente' })
  status: string; // pendente, aprovada, rejeitada, concluida

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorReembolso: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  tipoReembolso: string; // estorno, credito_loja

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @OneToMany(() => ItemDevolucao, item => item.devolucao, { cascade: true })
  itens: ItemDevolucao[];

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

@Entity('itens_devolucao')
export class ItemDevolucao {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Devolucao, dev => dev.itens)
  devolucao: Devolucao;

  @Column()
  produtoId: number;

  @ManyToOne(() => Produto)
  produto: Produto;

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  condicao: string; // bom, defeito, aberto
}
