import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './pedido.entity';
import { ItemPedido } from './item-pedido.entity';
import { PedidoHistorico } from './pedido-historico.entity';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { PdfService } from '../common/services/pdf.service';
import { Cliente } from '../clientes/cliente.entity';
import { Produto } from '../produtos/produto.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Usuario } from '../auth/usuario.entity';
import { Perfil } from '../perfis/perfil.entity';
import { FiscalExpandedModule } from '../fiscal/fiscal-expanded.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, ItemPedido, PedidoHistorico, Cliente, Produto, Usuario, Perfil]),
    NotificationsModule,
    forwardRef(() => FiscalExpandedModule),
  ],
  providers: [PedidosService, PdfService],
  controllers: [PedidosController],
  exports: [PedidosService],
})
export class PedidosModule {}

