import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './produto.entity';
import { ProdutosService } from './produtos.service';
import { ProdutosController, ApiProdutosController } from './produtos.controller';
import { DashboardController, ApiDashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Produto])],
  providers: [ProdutosService],
  controllers: [ProdutosController, ApiProdutosController, DashboardController, ApiDashboardController],
  exports: [ProdutosService],
})
export class ProdutosModule {}
