import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';

@Entity('plano_contas')
export class PlanoContaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column({ type: 'varchar', length: 20 })
  codigo: string;

  @Column({ type: 'varchar', length: 200 })
  descricao: string;

  @Column({ type: 'varchar', length: 20 })
  tipo: string; 

  @Column({ type: 'int', nullable: true })
  contaPaiId: number;

  @ManyToOne(() => PlanoContaEntity, { nullable: true })
  @JoinColumn({ name: 'contaPaiId' })
  contaPai: PlanoContaEntity;

  @Column({ type: 'int', default: 0 })
  nivel: number;

  @Column({ type: 'varchar', length: 20, default: 'ativo' })
  status: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

