import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('orcamentos')
export class Orcamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: string;

  @ManyToOne(() => Cliente)
  cliente: Cliente;

  @Column()
  clienteId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  desconto: number;

  @Column({ type: 'varchar', length: 20, default: 'pendente' })
  status: string;

  @Column({ type: 'timestamp' })
  dataValidade: Date;

  @Column({ nullable: true })
  observacoes: string;

  @ManyToOne(() => Usuario)
  vendedor: Usuario;

  @Column()
  vendedorId: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}






