import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('requisicoes')
export class Requisicao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: string;

  @Column({ type: 'varchar', length: 20, default: 'pendente' })
  status: string;

  @Column({ type: 'varchar', length: 20, default: 'normal' })
  prioridade: string;

  @Column({ type: 'timestamp' })
  dataSolicitacao: Date;

  @CreateDateColumn()
  createdAt: Date;
}

