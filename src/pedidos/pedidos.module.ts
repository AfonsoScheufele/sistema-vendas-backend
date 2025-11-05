import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './pedido.entity';
import { ItemPedido } from './item-pedido.entity';
import { PedidoHistorico } from './pedido-historico.entity';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, ItemPedido, PedidoHistorico])],
  providers: [PedidosService],
  controllers: [PedidosController],
  exports: [PedidosService],
})
export class PedidosModule {}

