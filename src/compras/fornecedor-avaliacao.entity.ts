import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('fornecedor_avaliacoes')
export class FornecedorAvaliacaoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column({ type: 'int' })
  fornecedorId: number;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  notaGeral: number;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  notaQualidade: number;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  notaPrazo: number;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  notaPreco: number;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  notaAtendimento: number;

  @Column({ type: 'varchar', length: 100 })
  avaliador: string;

  @Column({ type: 'text', nullable: true })
  comentarios: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

