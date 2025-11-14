import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FornecedoresController } from './fornecedores.controller';
import { FornecedoresService } from './fornecedores.service';
import { FornecedorEntity } from './fornecedor.entity';
import { FornecedorProdutoEntity } from './fornecedor-produto.entity';
import { FornecedoresAvancadoService } from '../fornecedores-avancado.service';
import { FornecedorAvaliacaoEntity } from '../fornecedor-avaliacao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FornecedorEntity, FornecedorProdutoEntity, FornecedorAvaliacaoEntity])],
  controllers: [FornecedoresController],
  providers: [FornecedoresService, FornecedoresAvancadoService],
  exports: [FornecedoresService],
})
export class FornecedoresModule {}
