import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrcamentoCentroDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(180)
  centroCusto!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(180)
  categoria!: string;

  @IsNotEmpty()
  @IsIn(['receita', 'despesa'])
  tipo!: 'receita' | 'despesa';

  @IsOptional()
  @IsIn(['mensal', 'trimestral', 'anual'])
  periodo?: 'mensal' | 'trimestral' | 'anual';

  @IsNotEmpty()
  @IsNumber()
  metaAnual!: number;

  @IsOptional()
  @IsNumber()
  realizadoAnual?: number;

  @IsOptional()
  @IsNumber()
  variacaoPercentual?: number;
}

