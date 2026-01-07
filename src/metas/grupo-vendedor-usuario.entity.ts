import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { GrupoVendedores } from './grupo-vendedores.entity';
import { Usuario } from '../auth/usuario.entity';

@Entity('grupo_vendedor_usuarios')
@Index(['grupoId', 'usuarioId'], { unique: true })
export class GrupoVendedorUsuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grupoId: number;

  @Column()
  usuarioId: number;

  @ManyToOne(() => GrupoVendedores, (grupo) => grupo.vendedores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grupoId' })
  grupo: GrupoVendedores;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @CreateDateColumn()
  criadoEm: Date;
}

