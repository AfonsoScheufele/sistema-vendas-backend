import { IsNotEmpty, IsNumber, IsArray, ValidateNested, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemVendaDto {
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  @IsNumber({}, { message: 'ID do produto deve ser um número' })
  produtoId!: number;

  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade deve ser pelo menos 1' })
  quantidade!: number;

  @IsOptional()
  @IsNumber()
  preco_unitario?: number;

  @IsOptional()
  @IsNumber()
  desconto?: number;

  @IsOptional()
  @IsNumber()
  comissao?: number;
}

export class CreateVendaDto {
  @IsNotEmpty({ message: 'ID do cliente é obrigatório' })
  @IsNumber({}, { message: 'ID do cliente deve ser um número' })
  clienteId!: number;

  @IsOptional()
  @IsNumber()
  vendedorId?: number;

  @IsArray({ message: 'Itens deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => ItemVendaDto)
  itens!: ItemVendaDto[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  desconto?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  formaPagamento?: string;

  @IsOptional()
  @IsNumber()
  parcelas?: number;
}
