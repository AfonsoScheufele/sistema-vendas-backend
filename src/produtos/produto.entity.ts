import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  descricao!: string;

  @Column('decimal')
  preco!: number;

  @Column('int', { default: 0 })
  estoque!: number;

  @Column({ nullable: true })
  categoria!: string;
}
