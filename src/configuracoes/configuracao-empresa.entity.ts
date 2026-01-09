import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('configuracao_empresa')
export class ConfiguracaoEmpresaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  @Index()
  empresaId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomeFantasia?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  razaoSocial?: string;

  @Column({ type: 'varchar', length: 18, nullable: true })
  cnpj?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  inscricaoEstadual?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  inscricaoMunicipal?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  celular?: string;

  @Column({ type: 'text', nullable: true })
  endereco?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cidade?: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  estado?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cep?: string;

  @Column({ type: 'varchar', length: 10, default: 'BRL' })
  moeda: string;

  @Column({ type: 'varchar', length: 10, default: 'pt-BR' })
  locale: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone?: string;

  @Column({ type: 'varchar', length: 20, default: 'DD/MM/YYYY' })
  formatoData: string;

  @Column({ type: 'varchar', length: 20, default: 'HH:mm' })
  formatoHora: string;

  @Column({ type: 'boolean', default: true })
  notificacoesEmail: boolean;

  @Column({ type: 'boolean', default: true })
  notificacoesSistema: boolean;

  @Column({ type: 'boolean', default: false })
  alertasVencimento: boolean;

  @Column({ type: 'int', default: 7 })
  diasAlertaVencimento: number;

  @Column({ type: 'boolean', default: true })
  alertasEstoque: boolean;

  @Column({ type: 'int', default: 10 })
  estoqueMinimoAlerta: number;

  @Column({ type: 'text', nullable: true })
  apiKeyExterna?: string;

  @Column({ type: 'boolean', default: false })
  integracaoERP: boolean;

  @Column({ type: 'boolean', default: false })
  integracaoEcommerce: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  webhookUrl?: string;

  @Column({ type: 'int', default: 90 })
  diasExpiracaoSenha: number;

  @Column({ type: 'boolean', default: true })
  exigirSenhaForte: boolean;

  @Column({ type: 'int', default: 5 })
  tentativasLoginMaximas: number;

  @Column({ type: 'int', default: 30 })
  tempoBloqueioMinutos: number;

  @Column({ type: 'boolean', default: true })
  backupAutomatico: boolean;

  @Column({ type: 'varchar', length: 20, default: 'diario' })
  frequenciaBackup: string;

  @Column({ type: 'int', default: 30 })
  diasRetencaoBackup: number;

  @Column({ type: 'boolean', default: true })
  relatoriosAutomaticos: boolean;

  @Column({ type: 'varchar', length: 20, default: 'mensal' })
  frequenciaRelatorios: string;

  @Column({ type: 'text', nullable: true })
  emailsRelatorios?: string;

  @Column({ type: 'json', nullable: true })
  modulosHabilitados?: string[]; 

  @Column({ type: 'json', nullable: true })
  configuracoesModulos?: Record<string, any>; 

  @Column({ type: 'boolean', default: false })
  permitirMultiFiliais: boolean;

  @Column({ type: 'boolean', default: true })
  permitirMultiMoedas: boolean;

  @Column({ type: 'boolean', default: false })
  usarWorkflowAprovacao: boolean;

  @Column({ type: 'boolean', default: false })
  usarControleLotes: boolean;

  @Column({ type: 'boolean', default: false })
  usarControleSerie: boolean;

  @Column({ type: 'boolean', default: true })
  usarComissoes: boolean;

  @Column({ type: 'boolean', default: true })
  usarMetas: boolean;

  @Column({ type: 'boolean', default: false })
  usarCRM: boolean;

  @Column({ type: 'boolean', default: false })
  usarLogistica: boolean;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}

