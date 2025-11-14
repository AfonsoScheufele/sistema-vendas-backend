import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstoqueDepositoEntity } from './entities/estoque-deposito.entity';
import { EstoqueMovimentacaoEntity } from './entities/estoque-movimentacao.entity';
import { EstoqueService } from './estoque.service';
import { ProdutosModule } from '../produtos/produtos.module';
import { EstoqueController } from './estoque.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EstoqueDepositoEntity, EstoqueMovimentacaoEntity]),
    forwardRef(() => ProdutosModule),
  ],
  controllers: [EstoqueController],
  providers: [EstoqueService],
  exports: [EstoqueService],
})
export class EstoqueModule {}


