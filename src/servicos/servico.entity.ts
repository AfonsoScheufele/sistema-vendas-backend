import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('servicos')
export class Servico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ nullable: true })
  descricao: string;

  @Column('decimal', { precision: 10, scale: 2 })
  preco: number;

  @Column({ nullable: true })
  codigoServico: string; // Código LC 116

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  aliquotaIss: number;

  @Column({ name: 'empresa_id' })
  empresaId: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
