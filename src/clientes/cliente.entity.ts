import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  telefone!: string;

  @Column({ nullable: true })
  endereco!: string;

  @Column({ nullable: true })
  cpf_cnpj!: string;
}
