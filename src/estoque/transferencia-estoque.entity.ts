import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Produto } from '../produtos/produto.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('transferencias_estoque')
export class TransferenciaEstoque {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  numero: string;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produto_id' })
  produto: Produto;

  @Column({ name: 'produto_id' })
  produtoId: number;

  @Column({ type: 'varchar', length: 100 })
  origem: string;

  @Column({ type: 'varchar', length: 100 })
  destino: string;

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorUnitario?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorTotal?: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pendente'
  })
  status: 'pendente' | 'em_transito' | 'concluida' | 'cancelada';

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: Usuario;

  @Column({ name: 'responsavel_id' })
  responsavelId: number;

  @Column({ type: 'timestamp', nullable: true })
  dataTransferencia?: Date;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
