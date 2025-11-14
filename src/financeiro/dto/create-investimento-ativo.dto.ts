import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateInvestimentoAtivoDto {
  @IsNotEmpty()
  @IsString()
  carteiraId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  ativo!: string;

  @IsNotEmpty()
  @IsIn(['renda_fixa', 'renda_variavel', 'caixa', 'fundo_imobiliario', 'internacional'])
  classe!: 'renda_fixa' | 'renda_variavel' | 'caixa' | 'fundo_imobiliario' | 'internacional';

  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  instituicao!: string;

  @IsNotEmpty()
  @IsNumber()
  valorAplicado!: number;

  @IsNotEmpty()
  @IsNumber()
  valorAtual!: number;

  @IsOptional()
  @IsNumber()
  rentabilidade12m?: number;

  @IsOptional()
  @IsIn(['baixo', 'medio', 'alto'])
  risco?: 'baixo' | 'medio' | 'alto';

  @IsOptional()
  @IsDateString()
  aplicadoEm?: string;

  @IsOptional()
  @IsDateString()
  atualizadoEmData?: string;
}

