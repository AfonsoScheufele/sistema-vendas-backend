import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('campanhas')
export class Campanha {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column()
  nome: string;

  @Column({ type: 'varchar', length: 20, default: 'rascunho' })
  status: string;

  @Column({ type: 'timestamp' })
  dataInicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataFim: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  orcamento: number;

  @Column({ nullable: true })
  observacoes: string;

  @CreateDateColumn()
  createdAt: Date;
}








