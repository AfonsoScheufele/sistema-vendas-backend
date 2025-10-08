import { IsNotEmpty, IsNumber, IsPositive, Min, Max, IsOptional } from 'class-validator';

export class CreateItemPedidoDto {
  @IsNotEmpty()
  @IsNumber()
  produtoId!: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantidade!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  comissao?: number;

  @IsOptional()
  @IsNumber()
  precoUnitario?: number;

  @IsOptional()
  @IsNumber()
  desconto?: number;
}