import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Fornecedor } from '../fornecedores/fornecedor.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('avaliacoes_fornecedor')
export class AvaliacaoFornecedor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Fornecedor)
  @JoinColumn({ name: 'fornecedor_id' })
  fornecedor: Fornecedor;

  @Column({ name: 'fornecedor_id' })
  fornecedorId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'avaliador_id' })
  avaliador: Usuario;

  @Column({ name: 'avaliador_id' })
  avaliadorId: number;

  @Column({ type: 'int', default: 0 })
  qualidadeProdutos: number;

  @Column({ type: 'int', default: 0 })
  prazoEntrega: number;

  @Column({ type: 'int', default: 0 })
  atendimento: number;

  @Column({ type: 'int', default: 0 })
  precoCompetitivo: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  notaMedia: number;

  @Column({ type: 'text', nullable: true })
  comentarios?: string;

  @Column({ type: 'text', nullable: true })
  pontosPositivos?: string;

  @Column({ type: 'text', nullable: true })
  pontosMelhoria?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ativo'
  })
  status: 'ativo' | 'inativo';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
