import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('auditoria')
@Index(['empresaId', 'dataAcao'])
@Index(['usuarioId', 'dataAcao'])
@Index(['tipoAcao', 'dataAcao'])
export class AuditoriaEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  empresaId?: string;

  @Column({ nullable: true })
  usuarioId?: number;

  @Column({ nullable: true })
  usuarioNome?: string;

  @Column()
  tipoAcao!: string; // 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', etc.

  @Column()
  entidade!: string; // 'Pedido', 'Cliente', 'Produto', etc.

  @Column({ nullable: true })
  entidadeId?: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'jsonb', nullable: true })
  dadosAntigos?: any;

  @Column({ type: 'jsonb', nullable: true })
  dadosNovos?: any;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  endpoint?: string;

  @Column({ nullable: true })
  metodoHttp?: string;

  @CreateDateColumn()
  dataAcao!: Date;
}

