import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutosModule } from './produtos/produtos.module';
import { ClientesModule } from './clientes/clientes.module';
import { VendasModule } from './vendas/vendas.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { OrcamentosModule } from './orcamentos/orcamentos.module';
import { Produto } from './produtos/produto.entity';
import { Cliente } from './clientes/cliente.entity';
import { Venda } from './vendas/venda.entity';
import { ItemVenda } from './vendas/item-venda.entity';
import { Pedido } from './pedidos/pedido.entity';
import { ItemPedido } from './pedidos/item-pedido.entity';
import { Usuario } from './auth/usuario.entity';
import { Orcamento } from './orcamentos/orcamento.entity';
import { ItemOrcamento } from './orcamentos/item-orcamento.entity';
import { NotificationsModule } from './notifications/notifications.module';

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
          Venda,
          ItemVenda,
          Pedido,
          ItemPedido,
          Usuario,
          Orcamento,
          ItemOrcamento,
        ],
        synchronize: true,
        logging: configService.get<string>('NODE_ENV') !== 'production',
        ssl: configService.get<string>('NODE_ENV') === 'production' ? {
          rejectUnauthorized: false
        } : false,
      }),
    }),
    ProdutosModule,
    ClientesModule,
    VendasModule,
    PedidosModule,
    DashboardModule,
    AuthModule,
    OrcamentosModule,
    NotificationsModule,
  ],
})
export class AppModule {}
