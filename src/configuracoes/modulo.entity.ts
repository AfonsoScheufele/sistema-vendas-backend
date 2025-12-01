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
  codigo: string; // Ex: 'vendas.pedidos', 'compras.fornecedores'

  @Column({ type: 'varchar', length: 200 })
  nome: string; // Ex: 'Pedidos de Venda', 'Fornecedores'

  @Column({ type: 'varchar', length: 500, nullable: true })
  descricao?: string;

  @Column({ type: 'enum', enum: ModuloCategoria })
  categoria: ModuloCategoria;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icone?: string; // Nome do ícone (lucide-react)

  @Column({ type: 'varchar', length: 200, nullable: true })
  rota?: string; // Rota principal do módulo

  @Column({ type: 'boolean', default: true })
  ativo: boolean; // Se o módulo está disponível no sistema

  @Column({ type: 'boolean', default: true })
  habilitadoPorPadrao: boolean; // Se deve ser habilitado automaticamente para novas empresas

  @Column({ type: 'int', default: 0 })
  ordem: number; // Ordem de exibição

  @Column({ type: 'json', nullable: true })
  configuracoes?: Record<string, any>; // Configurações específicas do módulo

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

