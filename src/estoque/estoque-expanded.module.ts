import { Module, forwardRef } from '@nestjs/common';
import { EstoqueExpandedController } from './estoque-expanded.controller';
import { ProdutosModule } from '../produtos/produtos.module';

@Module({
  imports: [forwardRef(() => ProdutosModule)],
  controllers: [EstoqueExpandedController],
})
export class EstoqueExpandedModule {}




