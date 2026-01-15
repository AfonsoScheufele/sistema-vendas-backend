import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { ProdutosModule } from '../produtos/produtos.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConfiguracoesModule } from '../configuracoes/configuracoes.module';
import { OrcamentosModule } from '../orcamentos/orcamentos.module';
import { PedidosModule } from '../pedidos/pedidos.module';
import { EmpresaEntity } from '../empresas/empresa.entity';
import { UsuarioEmpresaEntity } from '../empresas/usuario-empresa.entity';
import { Usuario } from '../auth/usuario.entity';
import { Orcamento } from '../orcamentos/orcamento.entity';
import { Pedido } from '../pedidos/pedido.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmpresaEntity, UsuarioEmpresaEntity, Usuario, Orcamento, Pedido]),
    ProdutosModule,
    FinanceiroModule,
    NotificationsModule,
    ConfiguracoesModule,
    OrcamentosModule,
    PedidosModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

