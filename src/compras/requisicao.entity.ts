import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('requisicoes')
export class Requisicao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  numero!: string;

  @Column()
  solicitante!: string;

  @Column()
  departamento!: string;

  @Column()
  descricao!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valorEstimado!: number;

  @Column({
    type: 'varchar',
    default: 'pendente'
  })
  status!: 'pendente' | 'aprovada' | 'rejeitada' | 'em-compra' | 'finalizada';

  @Column({
    type: 'varchar',
    default: 'media'
  })
  prioridade!: 'baixa' | 'media' | 'alta' | 'urgente';

  @CreateDateColumn()
  dataSolicitacao!: Date;

  @Column({ nullable: true })
  dataAprovacao?: Date;

  @Column({ nullable: true })
  observacoes?: string;

  @Column('json')
  itens!: Array<{
    id: number;
    descricao: string;
    quantidade: number;
    unidade: string;
    valorUnitario: number;
    valorTotal: number;
  }>;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}
