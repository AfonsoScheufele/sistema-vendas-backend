import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Produto } from '../produtos/produto.entity';
import { ComissaoVendedorEntity } from './comissao-vendedor.entity';

@Entity('comissoes')
export class ComissaoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  empresaId: string;

  @Column()
  produtoId: number;

  @ManyToOne(() => Produto, { nullable: true })
  produto?: Produto | null;

  @Column({ type: 'varchar', length: 20 })
  tipoComissaoBase: 'percentual' | 'fixo';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  comissaoBase: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  comissaoMinima: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  comissaoMaxima?: number | null;

  @Column({ default: true })
  ativo: boolean;

  @OneToMany(() => ComissaoVendedorEntity, (vendedor) => vendedor.comissao, {
    cascade: true,
    eager: true,
  })
  vendedores: ComissaoVendedorEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}



