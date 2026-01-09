import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('cotacoes')
export class CotacaoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column({ type: 'varchar', length: 50 })
  numero: string;

  @Column({ type: 'int' })
  fornecedorId: number;

  @Column({ type: 'varchar', length: 20, default: 'aberta' })
  status: string; 

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorTotal: number;

  @Column({ type: 'timestamp', nullable: true })
  dataValidade: Date;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
