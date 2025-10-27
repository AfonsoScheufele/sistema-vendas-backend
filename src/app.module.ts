import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutosModule } from './produtos/produtos.module';
import { ClientesModule } from './clientes/clientes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrcamentosModule } from './orcamentos/orcamentos.module';
import { CrmModule } from './crm/crm.module';
import { ComprasExpandedModule } from './compras/compras-expanded.module';
import { FiscalExpandedModule } from './fiscal/fiscal-expanded.module';
import { EstoqueExpandedModule } from './estoque/estoque-expanded.module';
import { LogisticaModule } from './logistica/logistica.module';
import { WebSocketModule } from './websocket/websocket.module';
import { ComissoesModule } from './comissoes/comissoes.module';
import { VendedoresModule } from './vendedores/vendedores.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { Produto } from './produtos/produto.entity';
import { Cliente } from './clientes/cliente.entity';
import { Usuario } from './auth/usuario.entity';
import { Pedido } from './pedidos/pedido.entity';
import { ItemPedido } from './pedidos/item-pedido.entity';
import { Notification } from './notifications/notification.entity';
import { Orcamento } from './orcamentos/orcamento.entity';
import { Lead } from './crm/lead.entity';
import { Oportunidade } from './crm/oportunidade.entity';
import { Campanha } from './crm/campanha.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          Produto,
          Cliente,
          Usuario,
          Pedido,
          ItemPedido,
          Notification,
          Orcamento,
          Lead,
          Oportunidade,
          Campanha,
        ],
        synchronize: true,
        logging: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    ProdutosModule,
    ClientesModule,
    DashboardModule,
    AuthModule,
    PedidosModule,
    NotificationsModule,
    OrcamentosModule,
    CrmModule,
    ComprasExpandedModule,
    FiscalExpandedModule,
    EstoqueExpandedModule,
    LogisticaModule,
    WebSocketModule,
    ComissoesModule,
    VendedoresModule,
    FinanceiroModule,
  ],
})
export class AppModule {}