import { IsNotEmpty, IsNumber, IsPositive, Min, Max } from 'class-validator';

export class CreateItemPedidoDto {
  @IsNotEmpty()
  @IsNumber()
  produtoId!: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantidade!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  comissao!: number;
}