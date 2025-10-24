import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Produto } from '../produtos/produto.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('alertas_estoque')
export class AlertaEstoque {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produto_id' })
  produto: Produto;

  @Column({ name: 'produto_id' })
  produtoId: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'estoque_baixo'
  })
  tipo: 'estoque_baixo' | 'vencimento' | 'excesso' | 'movimentacao';

  @Column({
    type: 'varchar',
    length: 20,
    default: 'medio'
  })
  nivel: 'critico' | 'alto' | 'medio' | 'baixo';

  @Column({ type: 'int', default: 0 })
  quantidadeAtual: number;

  @Column({ type: 'int', default: 0 })
  quantidadeMinima: number;

  @Column({ type: 'timestamp' })
  dataAlerta: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ativo'
  })
  status: 'ativo' | 'resolvido' | 'ignorado';

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'responsavel_id' })
  responsavel?: Usuario;

  @Column({ name: 'responsavel_id', nullable: true })
  responsavelId?: number;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
