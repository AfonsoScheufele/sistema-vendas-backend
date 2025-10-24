import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';

@Entity('inventarios')
export class Inventario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'date' })
  dataInicio: Date;

  @Column({ type: 'date' })
  dataFim: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: Usuario;

  @Column({ name: 'responsavel_id' })
  responsavelId: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'planejado'
  })
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';

  @Column({ type: 'int', default: 0 })
  totalItens: number;

  @Column({ type: 'int', default: 0 })
  itensContados: number;

  @Column({ type: 'int', default: 0 })
  divergencias: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  precisao: number;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
