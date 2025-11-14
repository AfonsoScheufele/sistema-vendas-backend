import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column()
  nome: string;

  @Column('text')
  descricao: string;

  @Column({ type: 'enum', enum: ['email', 'sms', 'notificacao', 'tarefa', 'integracao'] })
  tipo: 'email' | 'sms' | 'notificacao' | 'tarefa' | 'integracao';

  @Column({ type: 'enum', enum: ['ativo', 'inativo', 'pausado', 'erro'] })
  status: 'ativo' | 'inativo' | 'pausado' | 'erro';

  @Column()
  acionador: string;

  @Column('simple-array')
  condicoes: string[];

  @Column('simple-array')
  acoes: string[];

  @Column({ default: 0 })
  execucoes: number;

  @Column({ default: 0 })
  sucessos: number;

  @Column({ default: 0 })
  falhas: number;

  @Column({ nullable: true })
  ultimaExecucao: Date;

  @Column({ nullable: true })
  proximaExecucao: Date;

  @Column()
  responsavel: string;

  @ManyToOne(() => Usuario)
  usuario: Usuario;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

