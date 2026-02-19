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
  forma: string; // DINHEIRO, CARTAO_CREDITO, CARTAO_DEBITO, PIX

  @IsNumber()
  valor: number;
}

export class CreatePdvSaleDto {
  @IsNumber()
  @IsOptional()
  clienteId?: number; // Se não enviado, tentar usar Consumidor Final

  @IsArray()
  @IsNotEmpty()
  itens: ItemPdvDto[];

  @IsNumber()
  desconto: number;

  @IsOptional()
  pagamento?: PagamentoPdvDto;
}
