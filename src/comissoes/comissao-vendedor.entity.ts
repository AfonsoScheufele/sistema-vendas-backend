import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ComissaoEntity } from './comissao.entity';

@Entity('comissoes_vendedores')
export class ComissaoVendedorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  empresaId: string;

  @Column()
  vendedorId: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  vendedorNome?: string | null;

  @Column({ type: 'varchar', length: 20 })
  tipo: 'percentual' | 'fixo' | 'misto';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  percentual?: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorFixo?: number | null;

  @ManyToOne(() => ComissaoEntity, (comissao) => comissao.vendedores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comissao_id' })
  comissao: ComissaoEntity;
}


