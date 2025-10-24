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
import { FornecedoresModule } from './fornecedores/fornecedores.module';
import { CotacoesModule } from './cotacoes/cotacoes.module';
import { RequisicoesModule } from './compras/requisicoes.module';
import { ComprasModule } from './compras/compras.module';
import { CrmModule } from './crm/crm.module';
import { ConfigModule as ConfigModuleApp } from './config/config.module';
import { EstoqueModule } from './estoque/estoque.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { FiscalModule } from './fiscal/fiscal.module';
import { LogisticaModule } from './logistica/logistica.module';
import { Produto } from './produtos/produto.entity';
import { Cliente } from './clientes/cliente.entity';
import { Venda } from './vendas/venda.entity';
import { ItemVenda } from './vendas/item-venda.entity';
import { Pedido } from './pedidos/pedido.entity';
import { ItemPedido } from './pedidos/item-pedido.entity';
import { Usuario } from './auth/usuario.entity';
import { Orcamento } from './orcamentos/orcamento.entity';
import { ItemOrcamento } from './orcamentos/item-orcamento.entity';
import { Fornecedor } from './fornecedores/fornecedor.entity';
import { Cotacao } from './cotacoes/cotacao.entity';
import { Requisicao } from './compras/requisicao.entity';
import { PedidoCompra } from './compras/pedido-compra.entity';
import { AvaliacaoFornecedor } from './compras/avaliacao-fornecedor.entity';
import { ContratoFornecedor } from './compras/contrato-fornecedor.entity';
import { Inventario } from './estoque/inventario.entity';
import { AlertaEstoque } from './estoque/alerta-estoque.entity';
import { TransferenciaEstoque } from './estoque/transferencia-estoque.entity';
import { OportunidadeVenda } from './vendas/oportunidade-venda.entity';
import { Comissao } from './vendas/comissao.entity';
import { MetaVenda } from './vendas/meta-venda.entity';
import { Lead } from './crm/lead.entity';
import { Oportunidade } from './crm/oportunidade.entity';
import { Perfil } from './config/perfil.entity';
import { MovimentacaoEstoque } from './estoque/movimentacao-estoque.entity';
import { Lote } from './estoque/lote.entity';
import { Banco } from './financeiro/banco.entity';
import { MovimentacaoFinanceira } from './financeiro/movimentacao-financeira.entity';
import { Investimento } from './financeiro/investimento.entity';
import { OrcamentoFinanceiro } from './financeiro/orcamento-financeiro.entity';
import { NotaFiscal } from './fiscal/nota-fiscal.entity';
import { Transportadora } from './logistica/transportadora.entity';
import { Expedicao } from './logistica/expedicao.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/entities/notification.entity';
import { WebSocketModule } from './websocket/websocket.module';

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
                 Fornecedor,
                 Cotacao,
                 Requisicao,
                 PedidoCompra,
                 AvaliacaoFornecedor,
                 ContratoFornecedor,
                 Inventario,
                 AlertaEstoque,
                 TransferenciaEstoque,
                 OportunidadeVenda,
                 Comissao,
                 MetaVenda,
                 Lead,
                 Oportunidade,
                 Perfil,
                 MovimentacaoEstoque,
                 Lote,
                 Banco,
                 MovimentacaoFinanceira,
                 Investimento,
                 OrcamentoFinanceiro,
                 NotaFiscal,
                 Transportadora,
                 Expedicao,
                 Notification,
               ],
               synchronize: true,
               logging: configService.get<string>('NODE_ENV') !== 'production',
             }),
           }),
           ProdutosModule,
           ClientesModule,
           VendasModule,
           PedidosModule,
           DashboardModule,
           AuthModule,
           OrcamentosModule,
           FornecedoresModule,
           CotacoesModule,
           RequisicoesModule,
           ComprasModule,
           CrmModule,
           ConfigModuleApp,
           EstoqueModule,
           FinanceiroModule,
           FiscalModule,
           LogisticaModule,
          NotificationsModule,
          WebSocketModule,
  ],
})
export class AppModule {}
