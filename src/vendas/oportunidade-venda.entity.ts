import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';
import { Cliente } from '../clientes/cliente.entity';

@Entity('oportunidades_vendas')
export class OportunidadeVenda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'cliente_id' })
  clienteId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Column({ type: 'int', default: 0 })
  probabilidade: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'prospeccao'
  })
  etapa: 'prospeccao' | 'qualificacao' | 'proposta' | 'negociacao' | 'fechamento';

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: Usuario;

  @Column({ name: 'responsavel_id' })
  responsavelId: number;

  @Column({ type: 'timestamp', nullable: true })
  dataProximoContato?: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ativa'
  })
  status: 'ativa' | 'perdida' | 'ganha';

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
