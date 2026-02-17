import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  cpf!: string;

  @Column({ nullable: true })
  email?: string;

  @Column()
  senha!: string;

  @Column({ default: 'User' })
  role!: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: true })
  ativo!: boolean;

  @Column({ nullable: true })
  ultimoLogin?: Date;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @Column({ nullable: true })
  refreshTokenHash?: string;

  @Column({ nullable: true })
  refreshTokenExpires?: Date;

  @Column({ default: false })
  twoFactorEnabled!: boolean;

  @Column({ default: true })
  notificacoesLogin!: boolean;

  @Column({ default: true })
  bloquearAposTentativas!: boolean;

  @CreateDateColumn()
  dataCriacao!: Date;

  @UpdateDateColumn()
  dataAtualizacao!: Date;
}
