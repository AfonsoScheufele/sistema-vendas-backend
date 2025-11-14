import { Module } from '@nestjs/common';
import { RelatoriosController } from './relatorios.controller';
import { RelatoriosService } from './relatorios.service';
import { PedidosModule } from '../pedidos/pedidos.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { ContratosModule } from '../compras/contratos/contratos.module';
import { EstoqueModule } from '../estoque/estoque.module';
import { ClientesModule } from '../clientes/clientes.module';
import { FornecedoresModule } from '../compras/fornecedores/fornecedores.module';

@Module({
  imports: [
    PedidosModule,
    FinanceiroModule,
    ContratosModule,
    EstoqueModule,
    ClientesModule,
    FornecedoresModule,
  ],
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
})
export class RelatoriosModule {}


