import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Produto,
    Cliente
  ])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
