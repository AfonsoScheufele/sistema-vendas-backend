import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { ItemNotaFiscalEntity } from './item-nota-fiscal.entity';

@Entity('notas_fiscais')
export class NotaFiscalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  numero: string;

  @Column({ type: 'varchar', length: 50 })
  serie: string;

  @Column({ type: 'varchar', length: 20 })
  tipo: string; 

  @Column({ type: 'varchar', length: 50 })
  chaveAcesso: string;

  @Column({ type: 'int' })
  clienteId: number;

  @Column({ type: 'int', nullable: true })
  pedidoId: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ type: 'varchar', length: 20, default: 'pendente' })
  status: string; 

  @Column({ type: 'timestamp', nullable: true })
  dataEmissao: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataAutorizacao: Date;

  @Column({ type: 'text', nullable: true })
  xml: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @OneToMany(() => ItemNotaFiscalEntity, (item) => item.notaFiscal, { cascade: true, eager: true })
  itens?: ItemNotaFiscalEntity[];

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

