import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../auth/usuario.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'user_id' })
  user!: Usuario;

  @Column()
  title!: string;

  @Column({ nullable: true })
  message?: string;

  @Column({
    type: 'varchar',
    default: 'info'
  })
  type!: 'success' | 'warning' | 'info' | 'error';

  @Column({ default: false })
  read!: boolean;

  @Column({ nullable: true })
  actionUrl?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
