import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('requisicoes')
export class RequisicaoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column({ type: 'varchar', length: 50 })
  numero: string;

  @Column({ type: 'varchar', length: 100 })
  solicitante: string;

  @Column({ type: 'int', nullable: true })
  solicitanteId: number; 

  @Column({ type: 'varchar', length: 20, default: 'pendente' })
  status: string; 

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  aprovador: string;

  @Column({ type: 'timestamp', nullable: true })
  dataAprovacao: Date;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
