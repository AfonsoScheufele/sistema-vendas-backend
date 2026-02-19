import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdvService } from './pdv.service';
import { PdvController } from './pdv.controller';
import { Pedido } from '../pedidos/pedido.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, ItemPedido, Produto, Cliente]),
  ],
  controllers: [PdvController],
  providers: [PdvService],
})
export class PdvModule {}
