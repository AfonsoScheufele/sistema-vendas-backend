import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notas_fiscais')
export class NotaFiscal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  numero!: string;

  @Column()
  serie!: string;

  @Column({ unique: true })
  chave!: string;

  @Column()
  cliente!: string;

  @Column()
  cnpj!: string;

  @Column()
  dataEmissao!: Date;

  @Column({ nullable: true })
  dataSaida?: Date;

  @Column('decimal', { precision: 15, scale: 2 })
  valorTotal!: number;

  @Column({
    type: 'varchar',
    default: 'rascunho'
  })
  status!: 'rascunho' | 'emitida' | 'cancelada' | 'rejeitada' | 'autorizada';

  @Column({
    type: 'varchar',
    default: 'saida'
  })
  tipo!: 'entrada' | 'saida';

  @Column()
  cfop!: string;

  @Column()
  naturezaOperacao!: string;

  @Column({ nullable: true })
  observacoes?: string;

  @Column('json', { nullable: true })
  itens?: Array<{
    produto: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;

  @Column({ nullable: true })
  xml?: string;

  @Column({ nullable: true })
  pdf?: string;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}


