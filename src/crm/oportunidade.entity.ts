import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('oportunidades')
export class Oportunidade {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  cliente!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valor!: number;

  @Column({ default: 0 })
  probabilidade!: number;

  @Column({ 
    type: 'varchar',
    default: 'prospeccao'
  })
  fase!: 'prospeccao' | 'qualificacao' | 'proposta' | 'negociacao' | 'fechamento';

  @Column()
  dataFechamento!: Date;

  @Column()
  origem!: string;

  @Column()
  vendedor!: string;

  @Column({ 
    type: 'varchar',
    default: 'ativa'
  })
  status!: 'ativa' | 'perdida' | 'ganha';

  @CreateDateColumn()
  dataCriacao!: Date;

  @UpdateDateColumn()
  ultimaAtualizacao!: Date;

  @Column({ nullable: true })
  observacoes?: string;

  @Column('json', { nullable: true })
  atividades?: Array<{
    tipo: 'chamada' | 'email' | 'reuniao' | 'proposta';
    descricao: string;
    data: Date;
    responsavel: string;
  }>;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}
