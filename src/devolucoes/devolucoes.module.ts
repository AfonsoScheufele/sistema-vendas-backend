import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevolucoesService } from './devolucoes.service';
import { DevolucoesController } from './devolucoes.controller';
import { Devolucao, ItemDevolucao } from './devolucao.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { Produto } from '../produtos/produto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Devolucao, ItemDevolucao, Pedido, Produto]),
  ],
  controllers: [DevolucoesController],
  providers: [DevolucoesService],
})
export class DevolucoesModule {}
