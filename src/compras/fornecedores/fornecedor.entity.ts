import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FornecedorProdutoEntity } from './fornecedor-produto.entity';

@Entity('fornecedores')
export class FornecedorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  empresaId: string;

  @Column({ length: 180 })
  nome: string;

  @Column({ length: 220 })
  razaoSocial: string;

  @Column({ length: 20 })
  cnpj: string;

  @Column({ length: 30, nullable: true })
  inscricaoEstadual?: string | null;

  @Column({ length: 30, nullable: true })
  inscricaoMunicipal?: string | null;

  @Column({ type: 'jsonb' })
  endereco: Record<string, any>;

  @Column({ type: 'jsonb' })
  contato: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  bancario?: Record<string, any> | null;

  @Column({ length: 60 })
  categoria: string;

  @Column({ length: 20 })
  status: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string | null;

  @Column({ type: 'timestamp with time zone' })
  dataCadastro: Date;

  @OneToMany(() => FornecedorProdutoEntity, (produto) => produto.fornecedor, {
    cascade: true,
    eager: true,
  })
  produtos: FornecedorProdutoEntity[];

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}


