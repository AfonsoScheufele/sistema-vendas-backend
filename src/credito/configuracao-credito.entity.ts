import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type AcaoBloqueio = 'bloqueio_total' | 'alcada';

@Entity('configuracoes_credito')
export class ConfiguracaoCreditoEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'empresa_id' })
  empresaId!: string;

  @Column({ name: 'limite_credito_padrao', type: 'decimal', precision: 12, scale: 2, default: 0 })
  limiteCreditoPadrao!: number;

  @Column({ name: 'dias_tolerancia_padrao', type: 'int', default: 0 })
  diasToleranciaPadrao!: number;

  @Column({ name: 'acao_bloqueio', type: 'varchar', length: 20, default: 'bloqueio_total' })
  acaoBloqueio!: AcaoBloqueio;

  @Column({ name: 'cliente_tipo', nullable: true })
  clienteTipo?: string;

  @Column({ name: 'cliente_categoria_id', nullable: true })
  clienteCategoriaId?: number;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}
