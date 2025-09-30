import { IsNotEmpty, IsString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateItemPedidoDto } from './create-item-pedido.dto';

export class CreatePedidoDto {
  @IsNotEmpty()
  @IsString()
  cliente!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateItemPedidoDto)
  itens!: CreateItemPedidoDto[];
}