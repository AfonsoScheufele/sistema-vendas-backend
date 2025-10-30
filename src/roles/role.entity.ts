import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string; // ex.: admin, gerente

  @Column()
  name: string; // ex.: Administrador

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  active: boolean;

  // JSON string array de permission keys
  @Column({ type: 'text', default: '[]' })
  permissions: string;
}


