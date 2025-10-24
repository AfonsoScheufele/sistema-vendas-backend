import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Fornecedor } from '../fornecedores/fornecedor.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('contratos_fornecedor')
export class ContratoFornecedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  numero: string;

  @ManyToOne(() => Fornecedor)
  @JoinColumn({ name: 'fornecedor_id' })
  fornecedor: Fornecedor;

  @Column({ name: 'fornecedor_id' })
  fornecedorId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: Usuario;

  @Column({ name: 'responsavel_id' })
  responsavelId: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorContrato?: number;

  @Column({ type: 'date' })
  dataInicio: Date;

  @Column({ type: 'date' })
  dataFim: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'vigente'
  })
  status: 'vigente' | 'vencido' | 'cancelado' | 'renovado';

  @Column({ type: 'int', default: 0 })
  diasAntecedenciaRenovacao: number;

  @Column({ type: 'text', nullable: true })
  termosCondicoes?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
