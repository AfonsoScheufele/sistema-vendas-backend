import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('fornecedores')
export class Fornecedor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  razaoSocial!: string;

  @Column({ unique: true })
  cnpj!: string;

  @Column({ nullable: true })
  inscricaoEstadual?: string;

  @Column({ nullable: true })
  inscricaoMunicipal?: string;

  @Column('json')
  endereco!: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };

  @Column('json')
  contato!: {
    nome: string;
    cargo: string;
    telefone: string;
    email: string;
    celular?: string;
  };

  @Column('json')
  bancario!: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: 'corrente' | 'poupanca';
  };

  @Column()
  categoria!: string;

  @Column({ 
    type: 'varchar', 
    default: 'ativo'
  })
  status!: 'ativo' | 'inativo' | 'bloqueado';

  @Column({ nullable: true })
  observacoes?: string;

  @Column('json', { nullable: true })
  produtos?: Array<{
    id: number;
    nome: string;
    categoria: string;
    precoMedio: number;
  }>;

  @CreateDateColumn()
  dataCadastro!: Date;

  @UpdateDateColumn()
  dataAtualizacao!: Date;
}
