import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { NotaFiscalEntity } from './nota-fiscal.entity';
import { Produto } from '../produtos/produto.entity';

@Entity('nota_fiscal_itens')
export class ItemNotaFiscalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  empresaId: string;

  @ManyToOne(() => NotaFiscalEntity, (nf) => nf.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nota_fiscal_id' })
  notaFiscal: NotaFiscalEntity;

  @Column({ name: 'nota_fiscal_id' })
  notaFiscalId: number;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produto_id' })
  produto: Produto;

  @Column({ name: 'produto_id' })
  produtoId: number;

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valorUnitario: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valorTotal: number;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @CreateDateColumn()
  criadoEm: Date;
}

