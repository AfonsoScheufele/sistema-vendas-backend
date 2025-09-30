import { PartialType } from '@nestjs/mapped-types';
import { CreatePedidoDto } from './create-pedido.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {
  @IsOptional()
  @IsString()
  @IsIn(['pendente', 'processando', 'enviado', 'entregue', 'cancelado'])
  status?: string;
}