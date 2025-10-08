import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from './venda.entity';
import { ItemVenda } from './item-venda.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Usuario } from '../auth/usuario.entity';
import { VendasService } from './vendas.service';
import { VendasController, ApiVendasController } from './vendas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venda, ItemVenda, Produto, Cliente, Usuario])],
  providers: [VendasService],
  controllers: [VendasController, ApiVendasController],
  exports: [VendasService],
})
export class VendasModule {}
