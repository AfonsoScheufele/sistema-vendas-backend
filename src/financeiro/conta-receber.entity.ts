import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type StatusReceberEntity = 'aberta' | 'vencida' | 'recebida' | 'negociada';

@Entity('contas_receber')
@Index(['empresaId', 'status'])
@Index(['clienteId', 'empresaId'])
export class ContaReceberEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  titulo!: string;

  @Column()
  cliente!: string;

  @Column({ name: 'cliente_id', nullable: true })
  @Index()
  clienteId?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valor!: number;

  @Column({ name: 'valor_pago', type: 'decimal', precision: 12, scale: 2, default: 0 })
  valorPago!: number;

  @Column({ type: 'date' })
  emissao!: Date;

  @Column({ type: 'date' })
  vencimento!: Date;

  @Column({ type: 'date', nullable: true })
  pagamento?: Date;

  @Column({ type: 'varchar', length: 20, default: 'aberta' })
  status!: StatusReceberEntity;

  @Column({ nullable: true })
  categoria?: string;

  @Column({ name: 'forma_pagamento', nullable: true })
  formaPagamento?: string;

  @Column({ nullable: true })
  responsavel?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ name: 'empresa_id' })
  empresaId!: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}
