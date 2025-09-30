import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  email!: string;

  @Column()
  telefone!: string;

  @Column({ nullable: true })
  endereco?: string;

  @Column({ nullable: true })
  cpf_cnpj?: string;
}
