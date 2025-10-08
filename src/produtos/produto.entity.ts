import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  descricao?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  preco!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  precoCusto?: number;

  @Column('int', { default: 0 })
  estoque!: number;

  @Column('int', { default: 0 })
  estoqueMinimo!: number;

  @Column({ nullable: true })
  categoria?: string;

  @Column({ nullable: true })
  codigoBarras?: string;

  @Column({ nullable: true })
  sku?: string;

  @Column({ nullable: true })
  unidade?: string;

  @Column({ nullable: true })
  marca?: string;

  @Column({ nullable: true })
  modelo?: string;

  @Column('text', { nullable: true })
  observacoes?: string;

  @Column({ nullable: true })
  imagem?: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  peso?: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  largura?: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  altura?: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  profundidade?: number;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn()
  dataCriacao!: Date;

  @UpdateDateColumn()
  dataAtualizacao!: Date;
}
