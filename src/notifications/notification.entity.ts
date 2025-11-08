import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column('text')
  mensagem: string;

  @Column({ type: 'varchar', length: 20, default: 'info' })
  tipo: string;

  @Column({ type: 'boolean', default: false })
  lida: boolean;

  @Column({ type: 'varchar', length: 20, default: 'info' })
  prioridade: string;

  @ManyToOne(() => Usuario)
  usuario: Usuario;

  @Column()
  usuarioId: number;

  @CreateDateColumn()
  createdAt: Date;
}



