import { IsNotEmpty, IsString, IsArray, ValidateNested, ArrayMinSize, MinLength, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateItemPedidoDto } from './create-item-pedido.dto';

export class CreatePedidoDto {
  @IsNotEmpty({ message: 'ID do cliente é obrigatório' })
  @IsNumber({}, { message: 'ID do cliente deve ser um número' })
  clienteId!: number;

  @IsOptional()
  @IsNumber()
  vendedorId?: number;

  @IsArray({ message: 'Itens deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve ter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => CreateItemPedidoDto)
  itens!: CreateItemPedidoDto[];

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

  @IsOptional()
  @IsDateString()
  dataEntrega?: string;
}