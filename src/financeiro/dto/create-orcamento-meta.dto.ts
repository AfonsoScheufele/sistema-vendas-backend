import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class CreateOrcamentoMetaDto {
  @IsNotEmpty()
  @IsString()
  centroId!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'mes deve estar no formato YYYY-MM',
  })
  mes!: string;

  @IsNotEmpty()
  @IsNumber()
  meta!: number;

  @IsOptional()
  @IsNumber()
  realizado?: number;
}

