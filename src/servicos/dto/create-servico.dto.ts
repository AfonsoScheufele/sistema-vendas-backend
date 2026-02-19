import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';

export class CreateServicoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @Min(0)
  preco: number;

  @IsString()
  @IsOptional()
  codigoServico?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  aliquotaIss?: number;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
