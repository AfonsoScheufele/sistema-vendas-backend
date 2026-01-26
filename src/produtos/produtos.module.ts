import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './produto.entity';
import { ProdutosService } from './produtos.service';
import { ProdutosController, ApiProdutosController } from './produtos.controller';
import { ComissaoEntity } from '../comissoes/comissao.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { CategoriaDetectorService } from './categoria-detector.service';

@Module({
  imports: [TypeOrmModule.forFeature([Produto, ComissaoEntity, ItemPedido])],
  providers: [ProdutosService, CategoriaDetectorService],
  controllers: [ProdutosController, ApiProdutosController],
  exports: [ProdutosService],
})
export class ProdutosModule {}
