import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
import { ContabilModule } from './contabil/contabil.module';
import { WebSocketModule } from './websocket/websocket.module';
import { ComissoesModule } from './comissoes/comissoes.module';
import { VendedoresModule } from './vendedores/vendedores.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { AutomacaoModule } from './automacao/automacao.module';
import { UsuarioModule } from './usuario/usuario.module';
import { PerfisModule } from './perfis/perfis.module';
import { MetasModule } from './metas/metas.module';
import { MetaEntity } from './metas/meta.entity';
import { MetaProgressoEntity } from './metas/meta-progresso.entity';
import { GrupoVendedores } from './metas/grupo-vendedores.entity';
import { GrupoVendedorUsuario } from './metas/grupo-vendedor-usuario.entity';
import { FornecedorEntity } from './compras/fornecedores/fornecedor.entity';
import { FornecedorProdutoEntity } from './compras/fornecedores/fornecedor-produto.entity';
import { ContratoEntity } from './compras/contratos/contrato.entity';
import { CotacaoEntity } from './compras/cotacao.entity';
import { RequisicaoEntity } from './compras/requisicao.entity';
import { PedidoCompraEntity } from './compras/pedido-compra.entity';
import { EstoqueModule } from './estoque/estoque.module';
import { EstoqueDepositoEntity } from './estoque/entities/estoque-deposito.entity';
import { EstoqueMovimentacaoEntity } from './estoque/entities/estoque-movimentacao.entity';
import { LoteEntity } from './estoque/lote.entity';
import { InventarioEntity } from './estoque/inventario.entity';
import { ExpedicaoEntity } from './logistica/expedicao.entity';
import { TransportadoraEntity } from './logistica/transportadora.entity';
import { RoteiroEntity } from './logistica/roteiro.entity';
import { PlanoContaEntity } from './contabil/plano-conta.entity';
import { FornecedorAvaliacaoEntity } from './compras/fornecedor-avaliacao.entity';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { PdfModule } from './pdf/pdf.module';
import { ConfiguracoesModule } from './configuracoes/configuracoes.module';
import { ConfiguracaoEmpresaEntity } from './configuracoes/configuracao-empresa.entity';
import { ModuloEntity } from './configuracoes/modulo.entity';
import { ModuloEmpresaEntity } from './configuracoes/modulo-empresa.entity';
import { ConfiguracaoPaginaEntity } from './configuracoes/configuracao-pagina.entity';
import { PermissaoEntity } from './perfis/permissao.entity';
import { PerfilPermissaoEntity } from './perfis/perfil-permissao.entity';
import { EmpresaEntity } from './empresas/empresa.entity';
import { UsuarioEmpresaEntity } from './empresas/usuario-empresa.entity';
import { NotaFiscalEntity } from './fiscal/nota-fiscal.entity';
import { ItemNotaFiscalEntity } from './fiscal/item-nota-fiscal.entity';
import { SpedEntity } from './fiscal/sped.entity';
import { ImpostoEntity } from './fiscal/imposto.entity';
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
import { InvestimentoCarteira } from './financeiro/investimento-carteira.entity';
import { InvestimentoAtivo } from './financeiro/investimento-ativo.entity';
import { InvestimentoHistorico } from './financeiro/investimento-historico.entity';
import { InvestimentoAlerta } from './financeiro/investimento-alerta.entity';
import { OrcamentoCentroCustoEntity } from './financeiro/orcamento-centro.entity';
import { OrcamentoMetaMensal } from './financeiro/orcamento-meta.entity';
import { OrcamentoAlertaEntity } from './financeiro/orcamento-alerta.entity';
import { ContratosModule } from './compras/contratos/contratos.module';
import { FornecedoresModule } from './compras/fornecedores/fornecedores.module';
import { EmpresaContextInterceptor } from './common/interceptors/empresa-context.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuditoriaEntity } from './auditoria/auditoria.entity';
import { BackupModule } from './backup/backup.module';
import { BackupEntity } from './backup/backup.entity';
import { BackupConfigEntity } from './backup/backup-config.entity';
import { EmpresasModule } from './empresas/empresas.module';
import { ComissaoEntity } from './comissoes/comissao.entity';
import { ComissaoVendedorEntity } from './comissoes/comissao-vendedor.entity';
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
        const useSsl = configService.get<string>('DB_SSL') === 'true';

        let resolvedHost = host;
        try {
          const addresses = await dns.promises.resolve4(host);
          if (addresses.length > 0) {
            resolvedHost = addresses[0];
          }
        } catch (error) {
        }

        return {
          type: 'postgres',
          host: resolvedHost,
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
            InvestimentoCarteira,
            InvestimentoAtivo,
            InvestimentoHistorico,
            InvestimentoAlerta,
            OrcamentoCentroCustoEntity,
            OrcamentoMetaMensal,
            OrcamentoAlertaEntity,
            ComissaoEntity,
            ComissaoVendedorEntity,
            MetaEntity,
            MetaProgressoEntity,
            GrupoVendedores,
            GrupoVendedorUsuario,
            FornecedorEntity,
            FornecedorProdutoEntity,
            ContratoEntity,
            CotacaoEntity,
            RequisicaoEntity,
            PedidoCompraEntity,
            EstoqueDepositoEntity,
            EstoqueMovimentacaoEntity,
            LoteEntity,
            InventarioEntity,
            ConfiguracaoEmpresaEntity,
            ModuloEntity,
            ModuloEmpresaEntity,
            ConfiguracaoPaginaEntity,
            PermissaoEntity,
            PerfilPermissaoEntity,
            NotaFiscalEntity,
            ItemNotaFiscalEntity,
            SpedEntity,
            ImpostoEntity,
            ExpedicaoEntity,
            TransportadoraEntity,
            RoteiroEntity,
            PlanoContaEntity,
            FornecedorAvaliacaoEntity,
            EmpresaEntity,
            UsuarioEmpresaEntity,
            AuditoriaEntity,
            BackupEntity,
            BackupConfigEntity,
          ],
          synchronize: true,
          logging: false,
          ssl: useSsl
            ? {
            rejectUnauthorized: false,
              }
            : false,
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
    ContratosModule,
    FornecedoresModule,
    EmpresasModule,
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
    MetasModule,
    EstoqueModule,
    RelatoriosModule,
    ConfiguracoesModule,
    ContabilModule,
    PdfModule,
    AuditoriaModule,
    BackupModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: EmpresaContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
