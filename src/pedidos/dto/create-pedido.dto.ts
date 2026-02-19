import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemPedidoDto {
  @IsNumber()
  produtoId: number;

  @IsNumber()
  @Min(1)
  quantidade: number;

  @IsNumber()
  @IsOptional()
  precoUnitario?: number;

  @IsNumber()
  @IsOptional()
  comissao?: number;
}

export class CreatePedidoDto {
  @IsNumber()
  clienteId: number;

  @IsNumber()
  @IsOptional()
  vendedorId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemPedidoDto)
  itens: CreateItemPedidoDto[];

  @IsNumber()
  @IsOptional()
  desconto?: number;

  @IsNumber()
  @IsOptional()
  frete?: number;

  @IsString()
  @IsOptional()
  condicaoPagamento?: string;

  @IsString()
  @IsOptional()
  formaPagamento?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  statusPagamento?: string;

  @IsDateString()
  @IsOptional()
  dataPedido?: string;

  @IsDateString()
  @IsOptional()
  dataSaida?: string;

  @IsDateString()
  @IsOptional()
  dataEntregaPrevista?: string;

  @IsString()
  @IsOptional()
  enderecoEntrega?: string;

  @IsString()
  @IsOptional()
  transportadora?: string;

  @IsString()
  @IsOptional()
  origem?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
