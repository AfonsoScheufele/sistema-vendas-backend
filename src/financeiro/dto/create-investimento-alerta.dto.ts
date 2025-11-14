import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInvestimentoAlertaDto {
  @IsOptional()
  @IsString()
  carteiraId?: string;

  @IsNotEmpty()
  @IsString()
  recomendacao!: string;

  @IsOptional()
  @IsIn(['baixo', 'medio', 'alto'])
  impacto?: 'baixo' | 'medio' | 'alto';
}

