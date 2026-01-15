import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('campanhas_email')
export class CampanhaEmail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column()
  nome: string;

  @Column()
  assunto: string;

  @Column({ type: 'text', nullable: true })
  conteudo: string;

  @Column({ type: 'int', default: 0 })
  destinatarios: number;

  @Column({ type: 'int', default: 0 })
  enviados: number;

  @Column({ type: 'int', default: 0 })
  abertos: number;

  @Column({ type: 'int', default: 0 })
  cliques: number;

  @Column({ type: 'varchar', length: 20, default: 'rascunho' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  dataEnvio: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


