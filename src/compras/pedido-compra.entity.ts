import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Fornecedor } from '../fornecedores/fornecedor.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('pedidos_compra')
export class PedidoCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  numero: string;

  @ManyToOne(() => Fornecedor)
  @JoinColumn({ name: 'fornecedor_id' })
  fornecedor: Fornecedor;

  @Column({ name: 'fornecedor_id' })
  fornecedorId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: Usuario;

  @Column({ name: 'responsavel_id' })
  responsavelId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pendente'
  })
  status: 'pendente' | 'aprovado' | 'enviado' | 'recebido' | 'cancelado';

  @Column({ type: 'timestamp', nullable: true })
  dataAprovacao?: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataEnvio?: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataRecebimento?: Date;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
