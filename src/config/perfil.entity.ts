import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Notification } from '../notifications/entities/notification.entity';

@Entity('perfis')
export class Perfil {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  nome!: string;

  @Column()
  descricao!: string;

  @Column('json')
  permissoes!: string[];

  @Column({ default: true })
  ativo!: boolean;

  @OneToMany(() => Notification, notification => notification.user)
  notifications?: Notification[];

  @CreateDateColumn()
  dataCriacao!: Date;

  @UpdateDateColumn()
  dataAtualizacao!: Date;
}


