import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasExpandedController } from './compras-expanded.controller';
import { ComprasAvancadasService } from './compras-avancadas.service';
import { CotacaoEntity } from './cotacao.entity';
import { RequisicaoEntity } from './requisicao.entity';
import { PedidoCompraEntity } from './pedido-compra.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Usuario } from '../auth/usuario.entity';
import { Perfil } from '../perfis/perfil.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CotacaoEntity, RequisicaoEntity, PedidoCompraEntity, Usuario, Perfil]),
    NotificationsModule,
  ],
  controllers: [ComprasExpandedController],
  providers: [ComprasAvancadasService],
  exports: [ComprasAvancadasService],
})
export class ComprasExpandedModule {}








