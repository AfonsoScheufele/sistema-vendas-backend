import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ModuloEntity } from '../configuracoes/modulo.entity';

@Entity('permissoes')
export class PermissaoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  codigo: string; 

  @Column({ type: 'varchar', length: 200 })
  nome: string; 

  @Column({ type: 'varchar', length: 500, nullable: true })
  descricao?: string;

  @Column()
  moduloId: number;

  @ManyToOne(() => ModuloEntity)
  @JoinColumn({ name: 'moduloId' })
  modulo: ModuloEntity;

  @Column({ type: 'varchar', length: 50 })
  tipo: string; 

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ type: 'int', default: 0 })
  ordem: number;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

