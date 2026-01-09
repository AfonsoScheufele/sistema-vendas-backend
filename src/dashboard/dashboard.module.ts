import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { ProdutosModule } from '../produtos/produtos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, Cliente]),
    FinanceiroModule,
    ProdutosModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
