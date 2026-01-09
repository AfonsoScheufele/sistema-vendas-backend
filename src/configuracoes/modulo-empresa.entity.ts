import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ModuloEntity } from './modulo.entity';

@Entity('modulo_empresa')
@Index(['empresaId', 'moduloId'], { unique: true })
export class ModuloEmpresaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column()
  moduloId: number;

  @ManyToOne(() => ModuloEntity)
  @JoinColumn({ name: 'moduloId' })
  modulo: ModuloEntity;

  @Column({ type: 'boolean', default: true })
  habilitado: boolean; 

  @Column({ type: 'json', nullable: true })
  configuracoes?: Record<string, any>; 

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

