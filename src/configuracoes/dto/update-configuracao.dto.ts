import { IsOptional, IsString, IsBoolean, IsInt, IsEmail, Min, Max } from 'class-validator';

export class UpdateConfiguracaoDto {
  // Configurações Gerais
  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @IsOptional()
  @IsString()
  razaoSocial?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  inscricaoEstadual?: string;

  @IsOptional()
  @IsString()
  inscricaoMunicipal?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  celular?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  // Configurações de Negócio
  @IsOptional()
  @IsString()
  moeda?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  formatoData?: string;

  @IsOptional()
  @IsString()
  formatoHora?: string;

  // Configurações de Notificações
  @IsOptional()
  @IsBoolean()
  notificacoesEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  notificacoesSistema?: boolean;

  @IsOptional()
  @IsBoolean()
  alertasVencimento?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  diasAlertaVencimento?: number;

  @IsOptional()
  @IsBoolean()
  alertasEstoque?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  estoqueMinimoAlerta?: number;

  // Configurações de Integração
  @IsOptional()
  @IsString()
  apiKeyExterna?: string;

  @IsOptional()
  @IsBoolean()
  integracaoERP?: boolean;

  @IsOptional()
  @IsBoolean()
  integracaoEcommerce?: boolean;

  @IsOptional()
  @IsString()
  webhookUrl?: string;

  // Configurações de Segurança
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(365)
  diasExpiracaoSenha?: number;

  @IsOptional()
  @IsBoolean()
  exigirSenhaForte?: boolean;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(10)
  tentativasLoginMaximas?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60)
  tempoBloqueioMinutos?: number;

  // Configurações de Backup
  @IsOptional()
  @IsBoolean()
  backupAutomatico?: boolean;

  @IsOptional()
  @IsString()
  frequenciaBackup?: string;

  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(365)
  diasRetencaoBackup?: number;

  // Configurações de Relatórios
  @IsOptional()
  @IsBoolean()
  relatoriosAutomaticos?: boolean;

  @IsOptional()
  @IsString()
  frequenciaRelatorios?: string;

  @IsOptional()
  @IsString()
  emailsRelatorios?: string;
}

