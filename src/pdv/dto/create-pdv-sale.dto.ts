import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class ItemPdvDto {
  @IsNumber()
  produtoId: number;

  @IsNumber()
  quantidade: number;

  @IsNumber()
  precoUnitario: number;
}

class PagamentoPdvDto {
  @IsString()
  forma: string;

  @IsNumber()
  valor: number;
}

export class CreatePdvSaleDto {
  @IsNumber()
  @IsOptional()
  clienteId?: number;
  @IsArray()
  @IsNotEmpty()
  itens: ItemPdvDto[];

  @IsNumber()
  desconto: number;

  @IsOptional()
  pagamento?: PagamentoPdvDto;
}
