import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  telefone!: string;

  @Column({ nullable: true })
  telefone2?: string;

  @Column({ nullable: true })
  endereco?: string;

  @Column({ nullable: true })
  numero?: string;

  @Column({ nullable: true })
  complemento?: string;

  @Column({ nullable: true })
  bairro?: string;

  @Column({ nullable: true })
  cidade?: string;

  @Column({ nullable: true })
  estado?: string;

  @Column({ nullable: true })
  cep?: string;

  @Column({ nullable: true })
  cpf_cnpj?: string;

  @Column({ nullable: true })
  inscricaoEstadual?: string;

  @Column({ nullable: true })
  inscricaoMunicipal?: string;

  @Column({ nullable: true })
  contato?: string;

  @Column({ nullable: true })
  observacoes?: string;

  @Column({ default: 'PF' })
  tipo!: string; 


  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}