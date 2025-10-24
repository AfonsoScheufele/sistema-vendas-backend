import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../auth/usuario.entity';

@Entity('investimentos')
export class Investimento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorInvestido: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorAtual: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  rentabilidade: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'renda_fixa'
  })
  tipo: 'renda_fixa' | 'renda_variavel' | 'fundos' | 'criptomoedas' | 'imoveis';

  @Column({ type: 'date' })
  dataInvestimento: Date;

  @Column({ type: 'date', nullable: true })
  dataVencimento?: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: Usuario;

  @Column({ name: 'responsavel_id' })
  responsavelId: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ativo'
  })
  status: 'ativo' | 'resgatado' | 'vencido';

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
