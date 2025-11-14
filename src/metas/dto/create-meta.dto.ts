import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetaStatus, MetaTipo } from '../meta.entity';

export class CreateMetaDto {
  @IsString()
  @MaxLength(140)
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsEnum(['faturamento', 'vendas', 'novos_clientes', 'tickets_medio', 'atividades', 'customizada'])
  tipo: MetaTipo;

  @IsNumber()
  @IsPositive()
  valorObjetivo: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorAtual?: number;

  @IsDateString()
  periodoInicio: string;

  @IsDateString()
  periodoFim: string;

  @IsOptional()
  @IsEnum(['ativa', 'atingida', 'atrasada', 'cancelada'])
  status?: MetaStatus;

  @IsOptional()
  @IsNumber()
  responsavelId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  responsavelNome?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: false })
  @Type(() => String)
  tags?: string[];
}

export class AtualizarProgressoDto {
  @IsNumber()
  @Min(0)
  valorAtual: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  progressoPercentual?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  observacao?: string;
}


