import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('empresas')
export class EmpresaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  nome: string;

  @Column({ length: 18, unique: true, nullable: true })
  @Index()
  cnpj?: string;

  @Column({ length: 200, nullable: true })
  razaoSocial?: string;

  @Column({ length: 100, nullable: true })
  email?: string;

  @Column({ length: 20, nullable: true })
  telefone?: string;

  @Column({ length: 200, nullable: true })
  endereco?: string;

  @Column({ length: 10, nullable: true })
  numero?: string;

  @Column({ length: 100, nullable: true })
  complemento?: string;

  @Column({ length: 100, nullable: true })
  bairro?: string;

  @Column({ length: 100, nullable: true })
  cidade?: string;

  @Column({ length: 2, nullable: true })
  estado?: string;

  @Column({ length: 10, nullable: true })
  cep?: string;

  @Column({ length: 20, nullable: true })
  inscricaoEstadual?: string;

  @Column({ length: 20, nullable: true })
  inscricaoMunicipal?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}

