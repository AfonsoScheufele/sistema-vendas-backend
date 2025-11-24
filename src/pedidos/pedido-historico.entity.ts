import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('pedido_historico')
export class PedidoHistorico {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido)
  pedido: Pedido;

  @Column()
  pedidoId: number;

  @Column({ type: 'varchar', length: 50 })
  tipo: string; 

  @Column({ type: 'varchar', length: 100 })
  campo: string; 

  @Column({ type: 'text', nullable: true })
  valorAnterior: string;

  @Column({ type: 'text', nullable: true })
  valorNovo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @ManyToOne(() => Usuario, { nullable: true })
  usuario: Usuario;

  @Column({ nullable: true })
  usuarioId: number;

  @Column({ nullable: true })
  observacoes: string;

  @CreateDateColumn()
  createdAt: Date;
}














