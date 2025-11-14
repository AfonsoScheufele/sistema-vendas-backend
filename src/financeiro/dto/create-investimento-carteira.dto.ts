import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInvestimentoCarteiraDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(180)
  nome!: string;

  @IsOptional()
  @IsString()
  objetivo?: string;

  @IsOptional()
  @IsNumber()
  saldoAplicado?: number;

  @IsOptional()
  @IsNumber()
  saldoAtual?: number;

  @IsOptional()
  @IsNumber()
  rentabilidadeMensal?: number;

  @IsOptional()
  @IsNumber()
  rentabilidade12m?: number;

  @IsOptional()
  @IsIn(['baixo', 'medio', 'alto'])
  risco?: 'baixo' | 'medio' | 'alto';
}

