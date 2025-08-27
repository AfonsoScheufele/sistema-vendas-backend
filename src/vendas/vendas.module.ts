import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from './venda.entity';
import { ItemVenda } from './item-venda.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { VendasService } from './vendas.service';
import { VendasController } from './vendas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venda, ItemVenda, Produto, Cliente])],
  providers: [VendasService],
  controllers: [VendasController],
})
export class VendasModule {}
