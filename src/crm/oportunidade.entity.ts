import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('oportunidades')
export class Oportunidade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  clienteId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Column({ type: 'varchar', length: 20, default: 'prospeccao' })
  status: string;

  @Column({ type: 'varchar', length: 20, default: 'ativa' })
  fase: string;

  @Column({ nullable: true })
  observacoes: string;

  @Column({ type: 'timestamp', nullable: true })
  dataProximoContato: Date;

  @CreateDateColumn()
  dataCriacao: Date;

  @UpdateDateColumn()
  ultimaAtualizacao: Date;
}
