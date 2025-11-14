import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInvestimentoHistoricoDto {
  @IsOptional()
  @IsString()
  carteiraId?: string;

  @IsNotEmpty()
  @IsDateString()
  data!: string;

  @IsNotEmpty()
  @IsNumber()
  rentabilidade!: number;

  @IsOptional()
  @IsNumber()
  aporte?: number;

  @IsOptional()
  @IsNumber()
  resgate?: number;
}

