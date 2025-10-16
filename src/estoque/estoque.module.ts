import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstoqueService } from './estoque.service';
import { EstoqueController } from './estoque.controller';
import { MovimentacaoEstoque } from './movimentacao-estoque.entity';
import { Lote } from './lote.entity';
import { Produto } from '../produtos/produto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovimentacaoEstoque, Lote, Produto])],
  controllers: [EstoqueController],
  providers: [EstoqueService],
  exports: [EstoqueService],
})
export class EstoqueModule {}





