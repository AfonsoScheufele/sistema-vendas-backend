import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';
import { EmpresaEntity } from './empresa.entity';

@Entity('usuario_empresas')
@Index(['usuarioId', 'empresaId'], { unique: true })
export class UsuarioEmpresaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuarioId: number;

  @Column({ type: 'uuid' })
  empresaId: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'text', array: true, default: () => 'ARRAY[]::text[]' })
  permissoes: string[]; // Permissões específicas para este usuário nesta empresa

  @Column({ nullable: true })
  papel: string; // admin, gestor, vendedor, viewer, etc.

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @ManyToOne(() => EmpresaEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresaId' })
  empresa: EmpresaEntity;

  @CreateDateColumn()
  criadoEm: Date;
}

