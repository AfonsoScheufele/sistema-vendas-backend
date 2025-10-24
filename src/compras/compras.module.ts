import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { PedidoCompra } from './pedido-compra.entity';
import { AvaliacaoFornecedor } from './avaliacao-fornecedor.entity';
import { ContratoFornecedor } from './contrato-fornecedor.entity';
import { Fornecedor } from '../fornecedores/fornecedor.entity';
import { Usuario } from '../auth/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    PedidoCompra,
    AvaliacaoFornecedor,
    ContratoFornecedor,
    Fornecedor,
    Usuario
  ])],
  controllers: [ComprasController],
  providers: [ComprasService],
  exports: [ComprasService],
})
export class ComprasModule {}
