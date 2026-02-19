import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Servico } from '../servicos/servico.entity';
import { Cliente } from '../clientes/cliente.entity';

@Entity('notas_fiscais_servico')
export class NotaFiscalServicoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column({ type: 'varchar', length: 20 })
  numero: string;

  @Column({ type: 'varchar', length: 10, default: '1' })
  serie: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  rps: string; // Recibo Provisório de Serviços

  @Column({ type: 'int' })
  clienteId: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column({ type: 'int' })
  servicoId: number;

  @ManyToOne(() => Servico)
  @JoinColumn({ name: 'servicoId' })
  servico: Servico;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorServico: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  aliquotaIss: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorIss: number;

  @Column({ type: 'boolean', default: false })
  issRetido: boolean;

  @Column({ type: 'text', nullable: true })
  descricaoServico: string;

  @Column({ type: 'varchar', length: 20, default: 'emitida' })
  status: string; // emitida, cancelada, erro

  @Column({ type: 'text', nullable: true })
  xml: string;

  @Column({ type: 'text', nullable: true })
  pdfUrl: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn()
  dataEmissao: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
