import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Perfil } from './perfil.entity';
import { PermissaoEntity } from './permissao.entity';

@Entity('perfil_permissoes')
@Index(['perfilId', 'permissaoId'], { unique: true })
export class PerfilPermissaoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  perfilId: number;

  @ManyToOne(() => Perfil, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'perfilId' })
  perfil: Perfil;

  @Column()
  permissaoId: number;

  @ManyToOne(() => PermissaoEntity)
  @JoinColumn({ name: 'permissaoId' })
  permissao: PermissaoEntity;

  @Column({ type: 'boolean', default: true })
  habilitado: boolean;

  @CreateDateColumn()
  criadoEm: Date;
}

