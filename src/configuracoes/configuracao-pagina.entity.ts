import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmpresaEntity } from '../empresas/empresa.entity';

@Entity('configuracoes_paginas')
export class ConfiguracaoPaginaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  paginaId: string;

  @Column()
  nomePagina: string;

  @Column({ type: 'varchar', length: 20, default: 'lista' })
  layout: string;

  @Column({ type: 'int', default: 10 })
  itensPorPagina: number;

  @Column({ type: 'jsonb', nullable: true })
  ordenacaoPadrao: {
    campo: string;
    direcao: 'asc' | 'desc';
  };

  @Column({ type: 'jsonb', nullable: true })
  campos: Array<{
    id: string;
    nome: string;
    visivel: boolean;
    ordem: number;
    largura?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  filtros: Array<{
    id: string;
    nome: string;
    ativo: boolean;
    valorPadrao?: string;
  }>;

  @Column({ type: 'boolean', default: true })
  mostrarBusca: boolean;

  @Column({ type: 'boolean', default: true })
  mostrarFiltros: boolean;

  @Column({ type: 'boolean', default: true })
  mostrarExportacao: boolean;

  @Column({ type: 'boolean', default: true })
  mostrarEstatisticas: boolean;

  @Column({ type: 'jsonb', nullable: true })
  coresPersonalizadas?: {
    primaria?: string;
    secundaria?: string;
  };

  @Column({ type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => EmpresaEntity)
  @JoinColumn({ name: 'empresaId' })
  empresa: EmpresaEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


