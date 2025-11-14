import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('pedidos_compra')
export class PedidoCompraEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column({ type: 'varchar', length: 50 })
  numero: string;

  @Column({ type: 'int' })
  fornecedorId: number;

  @Column({ type: 'varchar', length: 20, default: 'rascunho' })
  status: string; // 'rascunho' | 'enviado' | 'confirmado' | 'recebido' | 'cancelado'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ type: 'timestamp', nullable: true })
  dataEnvio: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataConfirmacao: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataRecebimento: Date;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

