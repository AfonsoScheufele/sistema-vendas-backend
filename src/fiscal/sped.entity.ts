import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('sped')
export class SpedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column({ type: 'varchar', length: 20 })
  tipo: string; 

  @Column({ type: 'varchar', length: 10 })
  competencia: string; 

  @Column({ type: 'varchar', length: 50 })
  nomeArquivo: string;

  @Column({ type: 'varchar', length: 20, default: 'gerando' })
  status: string; 

  @Column({ type: 'text', nullable: true })
  conteudo: string;

  @Column({ type: 'timestamp', nullable: true })
  dataGeracao: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataEnvio: Date;

  @CreateDateColumn()
  criadoEm: Date;
}

