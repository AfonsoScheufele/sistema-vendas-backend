import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstoqueExpandedController } from './estoque-expanded.controller';
import { ProdutosModule } from '../produtos/produtos.module';
import { EstoqueModule } from './estoque.module';
import { EstoqueAvancadoService } from './estoque-avancado.service';
import { LoteEntity } from './lote.entity';
import { InventarioEntity } from './inventario.entity';

@Module({
  imports: [
    forwardRef(() => ProdutosModule),
    EstoqueModule,
    TypeOrmModule.forFeature([LoteEntity, InventarioEntity]),
  ],
  controllers: [EstoqueExpandedController],
  providers: [EstoqueAvancadoService],
  exports: [EstoqueAvancadoService],
})
export class EstoqueExpandedModule {}
