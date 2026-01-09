import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMovimentacaoDto {
  @IsInt()
  @IsPositive()
  produtoId: number;

  @IsEnum(['entrada', 'saida', 'transferencia', 'ajuste'])
  tipo: 'entrada' | 'saida' | 'transferencia' | 'ajuste';

  @IsInt()
  @IsPositive()
  quantidade: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  custoUnitario?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  observacao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  referencia?: string;

  @IsOptional()
  @IsString()
  depositoOrigemId?: string;

  @IsOptional()
  @IsString()
  depositoDestinoId?: string;

  @IsOptional()
  @IsInt()
  notaFiscalId?: number;
}


