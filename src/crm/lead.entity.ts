import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column()
  telefone: string;

  @Column({ type: 'varchar', length: 20, default: 'novo' })
  status: string;

  @Column({ nullable: true })
  origem: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ nullable: true })
  observacoes: string;

  @CreateDateColumn()
  dataCriacao: Date;

  @UpdateDateColumn()
  ultimaAtualizacao: Date;
}


