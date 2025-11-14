import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrcamentoAlertaDto {
  @IsOptional()
  @IsString()
  centroId?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(180)
  centroCusto!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(180)
  categoria!: string;

  @IsNotEmpty()
  @IsNumber()
  variacaoPercentual!: number;

  @IsNotEmpty()
  @IsString()
  mensagem!: string;

  @IsOptional()
  @IsIn(['baixo', 'medio', 'alto'])
  impacto?: 'baixo' | 'medio' | 'alto';
}

