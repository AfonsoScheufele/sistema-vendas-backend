import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdvService } from './pdv.service';
import { PdvController } from './pdv.controller';
import { Pedido } from '../pedidos/pedido.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { ComissaoEntity } from '../comissoes/comissao.entity';
import { PedidosModule } from '../pedidos/pedidos.module';
import { MetasModule } from '../metas/metas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, ItemPedido, Produto, Cliente, ComissaoEntity]),
    PedidosModule,
    MetasModule,
  ],
  controllers: [PdvController],
  providers: [PdvService],
})
export class PdvModule {}
