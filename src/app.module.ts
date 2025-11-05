import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'dns';
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
import { AutomacaoModule } from './automacao/automacao.module';
import { UsuarioModule } from './usuario/usuario.module';
import { PerfisModule } from './perfis/perfis.module';
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
import { Workflow } from './automacao/workflow.entity';
import { Perfil } from './perfis/perfil.entity';
dns.setDefaultResultOrder('ipv4first');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');
        const port = configService.get<number>('DB_PORT');
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_NAME');

        console.log(`🔌 Conectando ao Supabase Pooler: ${host}:${port}`);

        return {
          type: 'postgres',
          host: host,
          port: port,
          username: username,
          password: password,
          database: database,
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
            Workflow,
            Perfil,
          ],
          synchronize: true,
          logging: false,
          ssl: {
            rejectUnauthorized: false,
          },
          extra: {
            options: '--client_encoding=UTF8',
            max: 20, 
            idleTimeoutMillis: 30000, 
            connectionTimeoutMillis: 10000, 
          },
        };
      },
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
    AutomacaoModule,
    UsuarioModule,
    PerfisModule,
  ],
})
export class AppModule {}
