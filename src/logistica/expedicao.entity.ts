import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('expedicoes')
export class ExpedicaoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column({ type: 'varchar', length: 50 })
  numero: string;

  @Column({ type: 'int' })
  pedidoId: number;

  @Column({ type: 'varchar', length: 20, default: 'pendente' })
  status: string; 

  @Column({ type: 'varchar', length: 50, nullable: true })
  transportadora: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigoRastreamento: string;

  @Column({ type: 'timestamp', nullable: true })
  dataEnvio: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataPrevisaoEntrega: Date;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

