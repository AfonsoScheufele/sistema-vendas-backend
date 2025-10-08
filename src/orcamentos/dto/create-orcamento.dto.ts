import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional, IsEmail, IsNumber, Min, Max, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class CreateItemOrcamentoDto {
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  @IsNumber({}, { message: 'ID do produto deve ser um número' })
  produtoId!: number;

  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade deve ser pelo menos 1' })
  quantidade!: number;
}

export class CreateOrcamentoDto {
  @IsNotEmpty({ message: 'ID do cliente é obrigatório' })
  @IsNumber({}, { message: 'ID do cliente deve ser um número' })
  clienteId!: number;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsArray({ message: 'Itens deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve ter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => CreateItemOrcamentoDto)
  itens!: CreateItemOrcamentoDto[];

  @IsOptional()
  @IsNumber({}, { message: 'Desconto deve ser um número' })
  @Min(0, { message: 'Desconto não pode ser negativo' })
  @Max(100, { message: 'Desconto não pode ser maior que 100%' })
  desconto?: number;

  @IsOptional()
  @IsString()
  validade?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}