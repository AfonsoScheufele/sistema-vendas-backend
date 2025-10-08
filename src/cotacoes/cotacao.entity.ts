import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('cotacoes')
export class Cotacao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  numero!: string;

  @Column()
  descricao!: string;

  @Column('json')
  fornecedores!: Array<{
    id: number;
    nome: string;
    cnpj: string;
    contato: string;
    email: string;
    telefone: string;
  }>;

  @Column('json')
  itens!: Array<{
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    unidade: string;
    especificacoes?: string;
  }>;

  @Column({
    type: 'varchar',
    default: 'aberta'
  })
  status!: 'aberta' | 'em_analise' | 'concluida' | 'cancelada';

  @CreateDateColumn()
  dataAbertura!: Date;

  @Column({ nullable: true })
  dataFechamento?: Date;

  @Column()
  responsavel!: string;

  @Column({ nullable: true })
  observacoes?: string;

  @Column('json', { nullable: true })
  propostaVencedora?: {
    fornecedorId: number;
    valorTotal: number;
    prazoEntrega: number;
    condicoesPagamento: string;
  };

  @Column('json', { nullable: true })
  propostas?: Array<{
    id: number;
    fornecedorId: number;
    fornecedorNome: string;
    valorTotal: number;
    prazoEntrega: number;
    condicoesPagamento: string;
    observacoes?: string;
    dataProposta: Date;
  }>;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}
