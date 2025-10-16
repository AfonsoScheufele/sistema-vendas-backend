import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('transportadoras')
export class Transportadora {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  cnpj!: string;

  @Column()
  telefone!: string;

  @Column()
  email!: string;

  @Column('json')
  endereco!: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  valorFrete?: number;

  @Column({ nullable: true })
  prazoEntrega?: number;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}





