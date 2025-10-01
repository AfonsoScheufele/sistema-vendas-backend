import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Pedido } from '../pedidos/pedido.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Orcamento } from '../orcamentos/orcamento.entity';
import { ItemOrcamento } from '../orcamentos/item-orcamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Pedido,
    ItemPedido,
    Produto,
    Cliente,
    Orcamento,
    ItemOrcamento
  ])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
