import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  email!: string;

  @Column()
  telefone!: string;

  @Column()
  empresa!: string;

  @Column()
  origem!: string;

  @Column({
    type: 'varchar',
    default: 'novo'
  })
  status!: 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'convertido' | 'perdido';

  @Column({ default: 0 })
  score!: number;

  @CreateDateColumn()
  dataCriacao!: Date;

  @Column({ nullable: true })
  ultimoContato?: Date;

  @Column({ nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}
