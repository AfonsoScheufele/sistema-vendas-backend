import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('expedicoes')
export class Expedicao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  numero!: string;

  @Column()
  cliente!: string;

  @Column()
  enderecoEntrega!: string;

  @Column()
  transportadora!: string;

  @Column({ nullable: true })
  codigoRastreamento?: string;

  @Column({
    type: 'varchar',
    default: 'preparando'
  })
  status!: 'preparando' | 'enviado' | 'em_transito' | 'entregue' | 'devolvido';

  @Column('decimal', { precision: 10, scale: 2 })
  valorFrete!: number;

  @Column({ nullable: true })
  observacoes?: string;

  @Column()
  responsavel!: string;

  @CreateDateColumn()
  dataExpedicao!: Date;

  @Column({ nullable: true })
  dataEntrega?: Date;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}


