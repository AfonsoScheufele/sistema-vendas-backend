import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaEntity } from './empresa.entity';
import { UsuarioEmpresaEntity } from './usuario-empresa.entity';
import { Usuario } from '../auth/usuario.entity';
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

@Injectable()
export class MigracaoService implements OnModuleInit {
  constructor(
    @InjectRepository(EmpresaEntity)
    private readonly empresaRepo: Repository<EmpresaEntity>,
    @InjectRepository(UsuarioEmpresaEntity)
    private readonly usuarioEmpresaRepo: Repository<UsuarioEmpresaEntity>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Produto)
    private readonly produtoRepo: Repository<Produto>,
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(Orcamento)
    private readonly orcamentoRepo: Repository<Orcamento>,
    @InjectRepository(FornecedorEntity)
    private readonly fornecedorRepo: Repository<FornecedorEntity>,
    @InjectRepository(ContratoEntity)
    private readonly contratoRepo: Repository<ContratoEntity>,
    @InjectRepository(ComissaoEntity)
    private readonly comissaoRepo: Repository<ComissaoEntity>,
    @InjectRepository(MetaEntity)
    private readonly metaRepo: Repository<MetaEntity>,
    @InjectRepository(EstoqueDepositoEntity)
    private readonly depositoRepo: Repository<EstoqueDepositoEntity>,
    @InjectRepository(EstoqueMovimentacaoEntity)
    private readonly movimentacaoRepo: Repository<EstoqueMovimentacaoEntity>,
    @InjectRepository(LoteEntity)
    private readonly loteRepo: Repository<LoteEntity>,
    @InjectRepository(InventarioEntity)
    private readonly inventarioRepo: Repository<InventarioEntity>,
    @InjectRepository(CotacaoEntity)
    private readonly cotacaoRepo: Repository<CotacaoEntity>,
    @InjectRepository(RequisicaoEntity)
    private readonly requisicaoRepo: Repository<RequisicaoEntity>,
    @InjectRepository(PedidoCompraEntity)
    private readonly pedidoCompraRepo: Repository<PedidoCompraEntity>,
    @InjectRepository(NotaFiscalEntity)
    private readonly notaFiscalRepo: Repository<NotaFiscalEntity>,
    @InjectRepository(SpedEntity)
    private readonly spedRepo: Repository<SpedEntity>,
    @InjectRepository(ImpostoEntity)
    private readonly impostoRepo: Repository<ImpostoEntity>,
    @InjectRepository(ExpedicaoEntity)
    private readonly expedicaoRepo: Repository<ExpedicaoEntity>,
    @InjectRepository(TransportadoraEntity)
    private readonly transportadoraRepo: Repository<TransportadoraEntity>,
    @InjectRepository(RoteiroEntity)
    private readonly roteiroRepo: Repository<RoteiroEntity>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Oportunidade)
    private readonly oportunidadeRepo: Repository<Oportunidade>,
    @InjectRepository(Campanha)
    private readonly campanhaRepo: Repository<Campanha>,
    @InjectRepository(Workflow)
    private readonly workflowRepo: Repository<Workflow>,
    @InjectRepository(PlanoContaEntity)
    private readonly planoContaRepo: Repository<PlanoContaEntity>,
    @InjectRepository(FornecedorAvaliacaoEntity)
    private readonly fornecedorAvaliacaoRepo: Repository<FornecedorAvaliacaoEntity>,
  ) {}

  async onModuleInit() {
    // Aguardar um pouco para garantir que o banco está pronto
    setTimeout(() => {
      this.migrarDadosExistentes().catch((err) => {
        console.error('Erro na migração de dados:', err);
      });
    }, 5000);
  }

  async migrarDadosExistentes() {
    try {
      console.log('[Migração] Iniciando migração de dados para multi-empresa...');

      // 1. Criar empresa padrão se não existir
      const empresas = await this.empresaRepo.find({
        order: { criadoEm: 'ASC' },
        take: 1,
      });
      
      let empresaPadrao = empresas && empresas.length > 0 ? empresas[0] : null;

      if (!empresaPadrao) {
        console.log('[Migração] Criando empresa padrão...');
        empresaPadrao = this.empresaRepo.create({
          nome: 'Empresa Padrão',
          cnpj: null,
          ativo: true,
        });
        empresaPadrao = await this.empresaRepo.save(empresaPadrao);
        console.log('[Migração] Empresa padrão criada:', empresaPadrao.id);
      } else {
        console.log('[Migração] Usando empresa existente:', empresaPadrao.id);
      }

      // 2. Vincular todos os usuários existentes à empresa padrão
      const usuarios = await this.usuarioRepo.find();
      console.log(`[Migração] Encontrados ${usuarios.length} usuários para vincular`);

      for (const usuario of usuarios) {
        const vinculoExistente = await this.usuarioEmpresaRepo.findOne({
          where: { usuarioId: usuario.id, empresaId: empresaPadrao.id },
        });

        if (!vinculoExistente) {
          const vinculo = this.usuarioEmpresaRepo.create({
            usuarioId: usuario.id,
            empresaId: empresaPadrao.id,
            papel: usuario.role === 'Admin' ? 'admin' : 'viewer',
            permissoes: [],
            ativo: usuario.ativo,
          });
          await this.usuarioEmpresaRepo.save(vinculo);
          console.log(`[Migração] Usuário ${usuario.id} vinculado à empresa padrão`);
        }
      }

      // 3. Atualizar registros sem empresaId para usar empresa padrão
      console.log('[Migração] Atualizando registros sem empresaId...');

      // Clientes
      const clientesSemEmpresa = await this.clienteRepo
        .createQueryBuilder('cliente')
        .where('cliente.empresa_id IS NULL OR cliente.empresa_id = :empty', { empty: '' })
        .getMany();

      if (clientesSemEmpresa.length > 0) {
        await this.clienteRepo
          .createQueryBuilder()
          .update(Cliente)
          .set({ empresaId: empresaPadrao.id })
          .where('empresa_id IS NULL OR empresa_id = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${clientesSemEmpresa.length} clientes atualizados`);
      }

      // Produtos
      const produtosSemEmpresa = await this.produtoRepo
        .createQueryBuilder('produto')
        .where('produto.empresa_id IS NULL OR produto.empresa_id = :empty', { empty: '' })
        .getMany();

      if (produtosSemEmpresa.length > 0) {
        await this.produtoRepo
          .createQueryBuilder()
          .update(Produto)
          .set({ empresaId: empresaPadrao.id })
          .where('empresa_id IS NULL OR empresa_id = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${produtosSemEmpresa.length} produtos atualizados`);
      }

      // Pedidos
      const pedidosSemEmpresa = await this.pedidoRepo
        .createQueryBuilder('pedido')
        .where('pedido.empresa_id IS NULL OR pedido.empresa_id = :empty', { empty: '' })
        .getMany();

      if (pedidosSemEmpresa.length > 0) {
        await this.pedidoRepo
          .createQueryBuilder()
          .update(Pedido)
          .set({ empresaId: empresaPadrao.id })
          .where('empresa_id IS NULL OR empresa_id = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${pedidosSemEmpresa.length} pedidos atualizados`);
      }

      // Orçamentos
      const orcamentosSemEmpresa = await this.orcamentoRepo
        .createQueryBuilder('orcamento')
        .where('orcamento.empresa_id IS NULL OR orcamento.empresa_id = :empty', { empty: '' })
        .getMany();

      if (orcamentosSemEmpresa.length > 0) {
        await this.orcamentoRepo
          .createQueryBuilder()
          .update(Orcamento)
          .set({ empresaId: empresaPadrao.id })
          .where('empresa_id IS NULL OR empresa_id = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${orcamentosSemEmpresa.length} orçamentos atualizados`);
      }

      // Fornecedores
      const fornecedoresSemEmpresa = await this.fornecedorRepo
        .createQueryBuilder('fornecedor')
        .where('fornecedor.empresaId IS NULL OR fornecedor.empresaId = :empty', { empty: '' })
        .getMany();

      if (fornecedoresSemEmpresa.length > 0) {
        await this.fornecedorRepo
          .createQueryBuilder()
          .update(FornecedorEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${fornecedoresSemEmpresa.length} fornecedores atualizados`);
      }

      // Contratos
      const contratosSemEmpresa = await this.contratoRepo
        .createQueryBuilder('contrato')
        .where('contrato.empresaId IS NULL OR contrato.empresaId = :empty', { empty: '' })
        .getMany();

      if (contratosSemEmpresa.length > 0) {
        await this.contratoRepo
          .createQueryBuilder()
          .update(ContratoEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${contratosSemEmpresa.length} contratos atualizados`);
      }

      // Comissões
      const comissoesSemEmpresa = await this.comissaoRepo
        .createQueryBuilder('comissao')
        .where('comissao.empresaId IS NULL OR comissao.empresaId = :empty', { empty: '' })
        .getMany();

      if (comissoesSemEmpresa.length > 0) {
        await this.comissaoRepo
          .createQueryBuilder()
          .update(ComissaoEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${comissoesSemEmpresa.length} comissões atualizadas`);
      }

      // Metas
      const metasSemEmpresa = await this.metaRepo
        .createQueryBuilder('meta')
        .where('meta.empresaId IS NULL OR meta.empresaId = :empty', { empty: '' })
        .getMany();

      if (metasSemEmpresa.length > 0) {
        await this.metaRepo
          .createQueryBuilder()
          .update(MetaEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${metasSemEmpresa.length} metas atualizadas`);
      }

      // Depósitos
      const depositosSemEmpresa = await this.depositoRepo
        .createQueryBuilder('deposito')
        .where('deposito.empresaId IS NULL OR deposito.empresaId = :empty', { empty: '' })
        .getMany();

      if (depositosSemEmpresa.length > 0) {
        await this.depositoRepo
          .createQueryBuilder()
          .update(EstoqueDepositoEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${depositosSemEmpresa.length} depósitos atualizados`);
      }

      // Movimentações
      const movimentacoesSemEmpresa = await this.movimentacaoRepo
        .createQueryBuilder('movimentacao')
        .where('movimentacao.empresaId IS NULL OR movimentacao.empresaId = :empty', { empty: '' })
        .getMany();

      if (movimentacoesSemEmpresa.length > 0) {
        await this.movimentacaoRepo
          .createQueryBuilder()
          .update(EstoqueMovimentacaoEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${movimentacoesSemEmpresa.length} movimentações atualizadas`);
      }

      // Lotes
      const lotesSemEmpresa = await this.loteRepo
        .createQueryBuilder('lote')
        .where('lote.empresaId IS NULL OR lote.empresaId = :empty', { empty: '' })
        .getMany();

      if (lotesSemEmpresa.length > 0) {
        await this.loteRepo
          .createQueryBuilder()
          .update(LoteEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${lotesSemEmpresa.length} lotes atualizados`);
      }

      // Inventários
      const inventariosSemEmpresa = await this.inventarioRepo
        .createQueryBuilder('inventario')
        .where('inventario.empresaId IS NULL OR inventario.empresaId = :empty', { empty: '' })
        .getMany();

      if (inventariosSemEmpresa.length > 0) {
        await this.inventarioRepo
          .createQueryBuilder()
          .update(InventarioEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${inventariosSemEmpresa.length} inventários atualizados`);
      }

      // Cotações
      const cotacoesSemEmpresa = await this.cotacaoRepo
        .createQueryBuilder('cotacao')
        .where('cotacao.empresaId IS NULL OR cotacao.empresaId = :empty', { empty: '' })
        .getMany();

      if (cotacoesSemEmpresa.length > 0) {
        await this.cotacaoRepo
          .createQueryBuilder()
          .update(CotacaoEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${cotacoesSemEmpresa.length} cotações atualizadas`);
      }

      // Requisições
      const requisicoesSemEmpresa = await this.requisicaoRepo
        .createQueryBuilder('requisicao')
        .where('requisicao.empresaId IS NULL OR requisicao.empresaId = :empty', { empty: '' })
        .getMany();

      if (requisicoesSemEmpresa.length > 0) {
        await this.requisicaoRepo
          .createQueryBuilder()
          .update(RequisicaoEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${requisicoesSemEmpresa.length} requisições atualizadas`);
      }

      // Pedidos de Compra
      const pedidosCompraSemEmpresa = await this.pedidoCompraRepo
        .createQueryBuilder('pedidoCompra')
        .where('pedidoCompra.empresaId IS NULL OR pedidoCompra.empresaId = :empty', { empty: '' })
        .getMany();

      if (pedidosCompraSemEmpresa.length > 0) {
        await this.pedidoCompraRepo
          .createQueryBuilder()
          .update(PedidoCompraEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${pedidosCompraSemEmpresa.length} pedidos de compra atualizados`);
      }

      // Notas Fiscais
      const notasFiscaisSemEmpresa = await this.notaFiscalRepo
        .createQueryBuilder('notaFiscal')
        .where('notaFiscal.empresaId IS NULL OR notaFiscal.empresaId = :empty', { empty: '' })
        .getMany();

      if (notasFiscaisSemEmpresa.length > 0) {
        await this.notaFiscalRepo
          .createQueryBuilder()
          .update(NotaFiscalEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${notasFiscaisSemEmpresa.length} notas fiscais atualizadas`);
      }

      // SPED
      const spedsSemEmpresa = await this.spedRepo
        .createQueryBuilder('sped')
        .where('sped.empresaId IS NULL OR sped.empresaId = :empty', { empty: '' })
        .getMany();

      if (spedsSemEmpresa.length > 0) {
        await this.spedRepo
          .createQueryBuilder()
          .update(SpedEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${spedsSemEmpresa.length} SPEDs atualizados`);
      }

      // Impostos
      const impostosSemEmpresa = await this.impostoRepo
        .createQueryBuilder('imposto')
        .where('imposto.empresaId IS NULL OR imposto.empresaId = :empty', { empty: '' })
        .getMany();

      if (impostosSemEmpresa.length > 0) {
        await this.impostoRepo
          .createQueryBuilder()
          .update(ImpostoEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${impostosSemEmpresa.length} impostos atualizados`);
      }

      // Expedições
      const expedicoesSemEmpresa = await this.expedicaoRepo
        .createQueryBuilder('expedicao')
        .where('expedicao.empresaId IS NULL OR expedicao.empresaId = :empty', { empty: '' })
        .getMany();

      if (expedicoesSemEmpresa.length > 0) {
        await this.expedicaoRepo
          .createQueryBuilder()
          .update(ExpedicaoEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${expedicoesSemEmpresa.length} expedições atualizadas`);
      }

      // Transportadoras
      const transportadorasSemEmpresa = await this.transportadoraRepo
        .createQueryBuilder('transportadora')
        .where('transportadora.empresaId IS NULL OR transportadora.empresaId = :empty', { empty: '' })
        .getMany();

      if (transportadorasSemEmpresa.length > 0) {
        await this.transportadoraRepo
          .createQueryBuilder()
          .update(TransportadoraEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${transportadorasSemEmpresa.length} transportadoras atualizadas`);
      }

      // Roteiros
      const roteirosSemEmpresa = await this.roteiroRepo
        .createQueryBuilder('roteiro')
        .where('roteiro.empresaId IS NULL OR roteiro.empresaId = :empty', { empty: '' })
        .getMany();

      if (roteirosSemEmpresa.length > 0) {
        await this.roteiroRepo
          .createQueryBuilder()
          .update(RoteiroEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${roteirosSemEmpresa.length} roteiros atualizados`);
      }

      // Leads
      const leadsSemEmpresa = await this.leadRepo
        .createQueryBuilder('lead')
        .where('lead.empresaId IS NULL OR lead.empresaId = :empty', { empty: '' })
        .getMany();

      if (leadsSemEmpresa.length > 0) {
        await this.leadRepo
          .createQueryBuilder()
          .update(Lead)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${leadsSemEmpresa.length} leads atualizados`);
      }

      // Oportunidades
      const oportunidadesSemEmpresa = await this.oportunidadeRepo
        .createQueryBuilder('oportunidade')
        .where('oportunidade.empresaId IS NULL OR oportunidade.empresaId = :empty', { empty: '' })
        .getMany();

      if (oportunidadesSemEmpresa.length > 0) {
        await this.oportunidadeRepo
          .createQueryBuilder()
          .update(Oportunidade)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${oportunidadesSemEmpresa.length} oportunidades atualizadas`);
      }

      // Campanhas
      const campanhasSemEmpresa = await this.campanhaRepo
        .createQueryBuilder('campanha')
        .where('campanha.empresaId IS NULL OR campanha.empresaId = :empty', { empty: '' })
        .getMany();

      if (campanhasSemEmpresa.length > 0) {
        await this.campanhaRepo
          .createQueryBuilder()
          .update(Campanha)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${campanhasSemEmpresa.length} campanhas atualizadas`);
      }

      // Workflows
      const workflowsSemEmpresa = await this.workflowRepo
        .createQueryBuilder('workflow')
        .where('workflow.empresaId IS NULL OR workflow.empresaId = :empty', { empty: '' })
        .getMany();

      if (workflowsSemEmpresa.length > 0) {
        await this.workflowRepo
          .createQueryBuilder()
          .update(Workflow)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${workflowsSemEmpresa.length} workflows atualizados`);
      }

      // Plano de Contas
      const planosContaSemEmpresa = await this.planoContaRepo
        .createQueryBuilder('planoConta')
        .where('planoConta.empresaId IS NULL OR planoConta.empresaId = :empty', { empty: '' })
        .getMany();

      if (planosContaSemEmpresa.length > 0) {
        await this.planoContaRepo
          .createQueryBuilder()
          .update(PlanoContaEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${planosContaSemEmpresa.length} planos de conta atualizados`);
      }

      // Avaliações de Fornecedores
      const avaliacoesSemEmpresa = await this.fornecedorAvaliacaoRepo
        .createQueryBuilder('avaliacao')
        .where('avaliacao.empresaId IS NULL OR avaliacao.empresaId = :empty', { empty: '' })
        .getMany();

      if (avaliacoesSemEmpresa.length > 0) {
        await this.fornecedorAvaliacaoRepo
          .createQueryBuilder()
          .update(FornecedorAvaliacaoEntity)
          .set({ empresaId: empresaPadrao.id })
          .where('empresaId IS NULL OR empresaId = :empty', { empty: '' })
          .execute();
        console.log(`[Migração] ${avaliacoesSemEmpresa.length} avaliações de fornecedores atualizadas`);
      }

      console.log('[Migração] Migração concluída com sucesso!');
    } catch (error) {
      console.error('[Migração] Erro durante migração:', error);
      throw error;
    }
  }

  async executarMigracaoManual() {
    return this.migrarDadosExistentes();
  }
}

