import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController, ApiPedidosController } from './pedidos.controller';
import { Pedido } from './pedido.entity';
import { ItemPedido } from './item-pedido.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Usuario } from '../auth/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, ItemPedido, Produto, Cliente, Usuario])],
  controllers: [PedidosController, ApiPedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}