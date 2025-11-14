import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FornecedorEntity } from './fornecedor.entity';

@Entity('fornecedor_produtos')
export class FornecedorProdutoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  empresaId: string;

  @Column({ type: 'int', nullable: true })
  codigo?: number | null;

  @Column({ length: 160 })
  nome: string;

  @Column({ length: 120, nullable: true })
  categoria?: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  precoMedio: number;

  @ManyToOne(() => FornecedorEntity, (fornecedor) => fornecedor.produtos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fornecedor_id' })
  fornecedor: FornecedorEntity;

  @Column({ name: 'fornecedor_id' })
  fornecedorId: string;
}


