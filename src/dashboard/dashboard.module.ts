import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { ProdutosModule } from '../produtos/produtos.module';
import { PedidosModule } from '../pedidos/pedidos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, Cliente, Pedido, ItemPedido]),
    FinanceiroModule,
    ProdutosModule,
    PedidosModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
