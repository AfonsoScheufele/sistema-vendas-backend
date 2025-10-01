import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional, IsEmail, IsNumber, Min, Max, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class CreateItemOrcamentoDto {
  @IsNotEmpty()
  @IsNumber()
  produtoId!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantidade!: number;
}

export class CreateOrcamentoDto {
  @IsNotEmpty()
  @IsString()
  cliente!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateItemOrcamentoDto)
  itens!: CreateItemOrcamentoDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  desconto?: number;

  @IsOptional()
  @IsString()
  validade?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}