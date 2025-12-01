import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { EmpresaEntity } from './empresa.entity';
import { ConfiguracoesModule } from '../configuracoes/configuracoes.module';
import { UsuarioEmpresaEntity } from './usuario-empresa.entity';
import { UsuarioEmpresaService } from './usuario-empresa.service';
import { UsuarioEmpresaController } from './usuario-empresa.controller';
import { Usuario } from '../auth/usuario.entity';
import { MigracaoService } from './migracao.service';
import { Cliente } from '../clientes/cliente.entity';
import { Produto } from '../produtos/produto.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { Orcamento } from '../orcamentos/orcamento.entity';
import { FornecedorEntity } from '../compras/fornecedores/fornecedor.entity';
import { ContratoEntity } from '../compras/contratos/contrato.entity';
import { ComissaoEntity } from '../comissoes/comissao.entity';
import { MetaEntity } from '../metas/meta.entity';
import { EstoqueDepositoEntity } from '../estoque/entities/estoque-deposito.entity';
import { EstoqueMovimentacaoEntity } from '../estoque/entities/estoque-movimentacao.entity';
import { LoteEntity } from '../estoque/lote.entity';
import { InventarioEntity } from '../estoque/inventario.entity';
import { CotacaoEntity } from '../compras/cotacao.entity';
import { RequisicaoEntity } from '../compras/requisicao.entity';
import { PedidoCompraEntity } from '../compras/pedido-compra.entity';
import { NotaFiscalEntity } from '../fiscal/nota-fiscal.entity';
import { SpedEntity } from '../fiscal/sped.entity';
import { ImpostoEntity } from '../fiscal/imposto.entity';
import { ExpedicaoEntity } from '../logistica/expedicao.entity';
import { TransportadoraEntity } from '../logistica/transportadora.entity';
import { RoteiroEntity } from '../logistica/roteiro.entity';
import { Lead } from '../crm/lead.entity';
import { Oportunidade } from '../crm/oportunidade.entity';
import { Campanha } from '../crm/campanha.entity';
import { Workflow } from '../automacao/workflow.entity';
import { PlanoContaEntity } from '../contabil/plano-conta.entity';
import { FornecedorAvaliacaoEntity } from '../compras/fornecedor-avaliacao.entity';

@Module({
  imports: [
    forwardRef(() => ConfiguracoesModule),
    TypeOrmModule.forFeature([
      EmpresaEntity,
      UsuarioEmpresaEntity,
      Usuario,
      Cliente,
      Produto,
      Pedido,
      Orcamento,
      FornecedorEntity,
      ContratoEntity,
      ComissaoEntity,
      MetaEntity,
      EstoqueDepositoEntity,
      EstoqueMovimentacaoEntity,
      LoteEntity,
      InventarioEntity,
      CotacaoEntity,
      RequisicaoEntity,
      PedidoCompraEntity,
      NotaFiscalEntity,
      SpedEntity,
      ImpostoEntity,
      ExpedicaoEntity,
      TransportadoraEntity,
      RoteiroEntity,
      Lead,
      Oportunidade,
      Campanha,
      Workflow,
      PlanoContaEntity,
      FornecedorAvaliacaoEntity,
    ]),
  ],
  controllers: [EmpresasController, UsuarioEmpresaController],
  providers: [EmpresasService, UsuarioEmpresaService, MigracaoService],
  exports: [EmpresasService, UsuarioEmpresaService],
})
export class EmpresasModule {}

