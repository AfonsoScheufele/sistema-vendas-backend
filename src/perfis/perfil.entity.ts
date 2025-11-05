import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('perfis')
export class Perfil {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'simple-array', default: '' })
  permissoes!: string[];

  @Column({ default: true })
  ativo!: boolean;

  @Column({ default: 'blue' })
  cor!: string;

  @CreateDateColumn()
  dataCriacao!: Date;

  @UpdateDateColumn()
  dataAtualizacao!: Date;
}

