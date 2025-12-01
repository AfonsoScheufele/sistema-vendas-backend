import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelatoriosController } from './relatorios.controller';
import { RelatoriosService } from './relatorios.service';
import { PedidosModule } from '../pedidos/pedidos.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { ContratosModule } from '../compras/contratos/contratos.module';
import { EstoqueModule } from '../estoque/estoque.module';
import { ClientesModule } from '../clientes/clientes.module';
import { FornecedoresModule } from '../compras/fornecedores/fornecedores.module';
import { OrcamentosModule } from '../orcamentos/orcamentos.module';
import { ProdutosModule } from '../produtos/produtos.module';
import { Usuario } from '../auth/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    PedidosModule,
    FinanceiroModule,
    ContratosModule,
    EstoqueModule,
    ClientesModule,
    FornecedoresModule,
    OrcamentosModule,
    ProdutosModule,
  ],
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
})
export class RelatoriosModule {}


