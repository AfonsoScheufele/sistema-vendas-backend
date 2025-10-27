import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cotacoes')
export class Cotacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: string;

  @Column()
  fornecedor: string;

  @Column({ type: 'timestamp' })
  dataCotacao: Date;

  @Column({ type: 'varchar', length: 20, default: 'aberta' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ nullable: true })
  observacoes: string;

  @CreateDateColumn()
  createdAt: Date;
}



