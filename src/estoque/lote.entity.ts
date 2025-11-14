import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('lotes')
export class LoteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column({ type: 'varchar', length: 50 })
  numero: string;

  @Column({ type: 'int' })
  produtoId: number;

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ type: 'int', default: 0 })
  quantidadeUtilizada: number;

  @Column({ type: 'timestamp' })
  dataFabricacao: Date;

  @Column({ type: 'timestamp' })
  dataValidade: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  depositoId: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

