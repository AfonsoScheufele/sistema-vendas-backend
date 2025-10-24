import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from './venda.entity';
import { ItemVenda } from './item-venda.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Usuario } from '../auth/usuario.entity';
import { OportunidadeVenda } from './oportunidade-venda.entity';
import { Comissao } from './comissao.entity';
import { MetaVenda } from './meta-venda.entity';
import { VendasService } from './vendas.service';
import { VendasController } from './vendas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    Venda, 
    ItemVenda, 
    Produto, 
    Cliente, 
    Usuario,
    OportunidadeVenda,
    Comissao,
    MetaVenda
  ])],
  providers: [VendasService],
  controllers: [VendasController],
  exports: [VendasService],
})
export class VendasModule {}
