import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController, ApiDashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Venda } from '../vendas/venda.entity';
import { ItemVenda } from '../vendas/item-venda.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Orcamento } from '../orcamentos/orcamento.entity';
import { ItemOrcamento } from '../orcamentos/item-orcamento.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Venda,
    ItemVenda,
    Produto,
    Cliente,
    Orcamento,
    ItemOrcamento,
    Pedido,
    ItemPedido
  ])],
  controllers: [DashboardController, ApiDashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
