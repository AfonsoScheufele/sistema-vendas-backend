import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bancos')
export class Banco {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  codigo!: string;

  @Column({ nullable: true })
  agencia?: string;

  @Column({ nullable: true })
  conta?: string;

  @Column({ nullable: true })
  digitoConta?: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  saldo!: number;

  @Column({ default: true })
  ativo!: boolean;

  @Column({ nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}








