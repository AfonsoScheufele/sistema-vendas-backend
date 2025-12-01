import { IsOptional, IsString, IsBoolean, IsInt, IsEmail, Min, Max } from 'class-validator';

export class UpdateConfiguracaoDto {
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

