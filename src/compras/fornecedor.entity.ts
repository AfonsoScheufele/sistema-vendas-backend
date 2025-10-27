import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('fornecedores')
export class Fornecedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  cnpj: string;

  @Column()
  email: string;

  @Column()
  telefone: string;

  @Column({ nullable: true })
  observacoes: string;

  @CreateDateColumn()
  createdAt: Date;
}

