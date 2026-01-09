import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ModuloCategoria {
  VENDAS = 'vendas',
  ESTOQUE = 'estoque',
  COMPRAS = 'compras',
  FINANCEIRO = 'financeiro',
  FISCAL = 'fiscal',
  LOGISTICA = 'logistica',
  CRM = 'crm',
  RELATORIOS = 'relatorios',
  ADMINISTRACAO = 'administracao',
  CONFIGURACOES = 'configuracoes',
}

@Entity('modulos')
export class ModuloEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  codigo: string; 

  @Column({ type: 'varchar', length: 200 })
  nome: string; 

  @Column({ type: 'varchar', length: 500, nullable: true })
  descricao?: string;

  @Column({ type: 'enum', enum: ModuloCategoria })
  categoria: ModuloCategoria;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icone?: string; 

  @Column({ type: 'varchar', length: 200, nullable: true })
  rota?: string; 

  @Column({ type: 'boolean', default: true })
  ativo: boolean; 

  @Column({ type: 'boolean', default: true })
  habilitadoPorPadrao: boolean; 

  @Column({ type: 'int', default: 0 })
  ordem: number; 

  @Column({ type: 'json', nullable: true })
  configuracoes?: Record<string, any>; 

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

