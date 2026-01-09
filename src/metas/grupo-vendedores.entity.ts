import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { GrupoVendedorUsuario } from './grupo-vendedor-usuario.entity';
import { MetaEntity } from './meta.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('grupos_vendedores')
@Index(['empresaId', 'nome'], { unique: true })
export class GrupoVendedores {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string; 

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'uuid' })
  @Index()
  empresaId: string;

  @Column({ default: true })
  ativo: boolean;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'gerente_id' })
  gerente?: Usuario;

  @Column({ nullable: true, name: 'gerente_id' })
  gerenteId?: number;

  @OneToMany(() => GrupoVendedorUsuario, (gvu) => gvu.grupo, { cascade: true })
  vendedores: GrupoVendedorUsuario[];

  @OneToMany(() => MetaEntity, (meta) => meta.grupoVendedores)
  metas: MetaEntity[];

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

