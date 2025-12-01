import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuloEntity, ModuloCategoria } from './modulo.entity';

@Injectable()
export class ModulosSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(ModuloEntity)
    private readonly moduloRepository: Repository<ModuloEntity>,
  ) {}

  async onModuleInit() {
    const modulos = [
      { codigo: 'cadastros.clientes', nome: 'Clientes', categoria: ModuloCategoria.VENDAS, icone: 'Users', rota: '/vendas/clientes', ordem: 1, habilitadoPorPadrao: true },
      { codigo: 'cadastros.produtos', nome: 'Produtos', categoria: ModuloCategoria.VENDAS, icone: 'Package', rota: '/vendas/produtos', ordem: 2, habilitadoPorPadrao: true },
      { codigo: 'cadastros.fornecedores', nome: 'Fornecedores', categoria: ModuloCategoria.COMPRAS, icone: 'Building', rota: '/compras/fornecedores', ordem: 3, habilitadoPorPadrao: true },
      { codigo: 'vendas.pedidos', nome: 'Pedidos', categoria: ModuloCategoria.VENDAS, icone: 'Clipboard', rota: '/vendas/pedidos', ordem: 10, habilitadoPorPadrao: true },
      { codigo: 'vendas.orcamentos', nome: 'Orçamentos', categoria: ModuloCategoria.VENDAS, icone: 'Clipboard', rota: '/vendas/orcamentos', ordem: 11, habilitadoPorPadrao: true },
      { codigo: 'vendas.pipeline', nome: 'Pipeline', categoria: ModuloCategoria.VENDAS, icone: 'TrendingUp', rota: '/vendas/pipeline', ordem: 12, habilitadoPorPadrao: true },
      { codigo: 'vendas.comissoes', nome: 'Comissões', categoria: ModuloCategoria.VENDAS, icone: 'DollarSign', rota: '/vendas/comissoes', ordem: 13, habilitadoPorPadrao: true },
      { codigo: 'vendas.metas', nome: 'Metas', categoria: ModuloCategoria.VENDAS, icone: 'Target', rota: '/vendas/metas', ordem: 14, habilitadoPorPadrao: true },
      { codigo: 'estoque.produtos', nome: 'Produtos em Estoque', categoria: ModuloCategoria.ESTOQUE, icone: 'Package', rota: '/estoque/produtos', ordem: 20, habilitadoPorPadrao: true },
      { codigo: 'estoque.movimentacoes', nome: 'Movimentações', categoria: ModuloCategoria.ESTOQUE, icone: 'Activity', rota: '/estoque/movimentacoes', ordem: 21, habilitadoPorPadrao: true },
      { codigo: 'estoque.transferencias', nome: 'Transferências', categoria: ModuloCategoria.ESTOQUE, icone: 'Truck', rota: '/estoque/transferencias', ordem: 22, habilitadoPorPadrao: true },
      { codigo: 'estoque.lotes', nome: 'Lotes e Validade', categoria: ModuloCategoria.ESTOQUE, icone: 'Calendar', rota: '/estoque/lotes', ordem: 23, habilitadoPorPadrao: false },
      { codigo: 'estoque.inventario', nome: 'Inventário', categoria: ModuloCategoria.ESTOQUE, icone: 'Clipboard', rota: '/estoque/inventario', ordem: 24, habilitadoPorPadrao: true },
      { codigo: 'compras.requisicoes', nome: 'Requisições', categoria: ModuloCategoria.COMPRAS, icone: 'FileText', rota: '/compras/requisicoes', ordem: 30, habilitadoPorPadrao: true },
      { codigo: 'compras.cotacoes', nome: 'Cotações', categoria: ModuloCategoria.COMPRAS, icone: 'DollarSign', rota: '/compras/cotacoes', ordem: 31, habilitadoPorPadrao: true },
      { codigo: 'compras.pedidos', nome: 'Pedidos de Compra', categoria: ModuloCategoria.COMPRAS, icone: 'ShoppingCart', rota: '/compras/pedidos', ordem: 32, habilitadoPorPadrao: true },
      { codigo: 'compras.contratos', nome: 'Contratos', categoria: ModuloCategoria.COMPRAS, icone: 'FileText', rota: '/compras/contratos', ordem: 33, habilitadoPorPadrao: true },
      { codigo: 'financeiro.receber', nome: 'Contas a Receber', categoria: ModuloCategoria.FINANCEIRO, icone: 'TrendingUp', rota: '/financeiro/receber', ordem: 40, habilitadoPorPadrao: true },
      { codigo: 'financeiro.pagar', nome: 'Contas a Pagar', categoria: ModuloCategoria.FINANCEIRO, icone: 'TrendingUp', rota: '/financeiro/pagar', ordem: 41, habilitadoPorPadrao: true },
      { codigo: 'financeiro.fluxo', nome: 'Fluxo de Caixa', categoria: ModuloCategoria.FINANCEIRO, icone: 'BarChart3', rota: '/financeiro/fluxo', ordem: 42, habilitadoPorPadrao: true },
      { codigo: 'financeiro.bancos', nome: 'Bancos e Caixas', categoria: ModuloCategoria.FINANCEIRO, icone: 'CreditCard', rota: '/financeiro/bancos', ordem: 43, habilitadoPorPadrao: true },
      { codigo: 'financeiro.conciliacao', nome: 'Conciliação Bancária', categoria: ModuloCategoria.FINANCEIRO, icone: 'Scale', rota: '/financeiro/conciliacao', ordem: 44, habilitadoPorPadrao: false },
      { codigo: 'fiscal.notas', nome: 'Notas Fiscais', categoria: ModuloCategoria.FISCAL, icone: 'FileText', rota: '/fiscal/notas', ordem: 50, habilitadoPorPadrao: false },
      { codigo: 'fiscal.sped', nome: 'Obrigações (SPED)', categoria: ModuloCategoria.FISCAL, icone: 'Database', rota: '/fiscal/sped', ordem: 51, habilitadoPorPadrao: false },
      { codigo: 'fiscal.impostos', nome: 'Apuração de Impostos', categoria: ModuloCategoria.FISCAL, icone: 'TrendingUp', rota: '/fiscal/impostos', ordem: 52, habilitadoPorPadrao: false },
      { codigo: 'contabil.relatorios', nome: 'Relatórios Contábeis', categoria: ModuloCategoria.FISCAL, icone: 'BarChart3', rota: '/contabil/relatorios', ordem: 53, habilitadoPorPadrao: false },
      { codigo: 'contabil.plano-contas', nome: 'Plano de Contas', categoria: ModuloCategoria.FISCAL, icone: 'Layers', rota: '/contabil/plano-contas', ordem: 54, habilitadoPorPadrao: false },
      { codigo: 'logistica.expedicao', nome: 'Expedição', categoria: ModuloCategoria.LOGISTICA, icone: 'Truck', rota: '/logistica/expedicao', ordem: 60, habilitadoPorPadrao: false },
      { codigo: 'logistica.transportadoras', nome: 'Transportadoras', categoria: ModuloCategoria.LOGISTICA, icone: 'Building', rota: '/logistica/transportadoras', ordem: 61, habilitadoPorPadrao: false },
      { codigo: 'logistica.roteiros', nome: 'Roteirização', categoria: ModuloCategoria.LOGISTICA, icone: 'Globe', rota: '/logistica/roteiros', ordem: 62, habilitadoPorPadrao: false },
      { codigo: 'logistica.rastreamento', nome: 'Rastreamento', categoria: ModuloCategoria.LOGISTICA, icone: 'Target', rota: '/logistica/rastreamento', ordem: 63, habilitadoPorPadrao: false },
      { codigo: 'logistica.centros', nome: 'Centros de Distribuição', categoria: ModuloCategoria.LOGISTICA, icone: 'Building', rota: '/logistica/centros', ordem: 64, habilitadoPorPadrao: false },
      { codigo: 'crm.leads', nome: 'Leads', categoria: ModuloCategoria.CRM, icone: 'Users', rota: '/crm/leads', ordem: 70, habilitadoPorPadrao: false },
      { codigo: 'crm.oportunidades', nome: 'Oportunidades', categoria: ModuloCategoria.CRM, icone: 'Target', rota: '/crm/oportunidades', ordem: 71, habilitadoPorPadrao: false },
      { codigo: 'crm.campanhas', nome: 'Campanhas', categoria: ModuloCategoria.CRM, icone: 'Megaphone', rota: '/crm/campanhas', ordem: 72, habilitadoPorPadrao: false },
      { codigo: 'crm.email', nome: 'E-mail Marketing', categoria: ModuloCategoria.CRM, icone: 'Mail', rota: '/crm/email', ordem: 73, habilitadoPorPadrao: false },
      { codigo: 'crm.automacao', nome: 'Automação', categoria: ModuloCategoria.CRM, icone: 'Cpu', rota: '/crm/automacao', ordem: 74, habilitadoPorPadrao: false },
      { codigo: 'relatorios.analytics', nome: 'Analytics', categoria: ModuloCategoria.RELATORIOS, icone: 'Activity', rota: '/relatorios/analytics', ordem: 80, habilitadoPorPadrao: true },
      { codigo: 'relatorios.kpis', nome: 'KPIs', categoria: ModuloCategoria.RELATORIOS, icone: 'TrendingUp', rota: '/relatorios/kpis', ordem: 81, habilitadoPorPadrao: true },
      { codigo: 'relatorios.vendas', nome: 'Vendas por Período', categoria: ModuloCategoria.RELATORIOS, icone: 'BarChart3', rota: '/relatorios/vendas', ordem: 82, habilitadoPorPadrao: true },
      { codigo: 'relatorios.clientes', nome: 'Clientes Ativos', categoria: ModuloCategoria.RELATORIOS, icone: 'Users', rota: '/relatorios/clientes', ordem: 83, habilitadoPorPadrao: true },
      { codigo: 'relatorios.estoque', nome: 'Giro de Estoque', categoria: ModuloCategoria.RELATORIOS, icone: 'Package', rota: '/relatorios/estoque', ordem: 84, habilitadoPorPadrao: true },
      { codigo: 'relatorios.financeiro', nome: 'Financeiro', categoria: ModuloCategoria.RELATORIOS, icone: 'DollarSign', rota: '/relatorios/financeiro', ordem: 85, habilitadoPorPadrao: true },
      { codigo: 'relatorios.compras', nome: 'Compras', categoria: ModuloCategoria.RELATORIOS, icone: 'ShoppingCart', rota: '/relatorios/compras', ordem: 86, habilitadoPorPadrao: true },
      { codigo: 'relatorios.exportacao', nome: 'Exportação', categoria: ModuloCategoria.RELATORIOS, icone: 'Database', rota: '/relatorios/exportacao', ordem: 87, habilitadoPorPadrao: true },
      { codigo: 'relatorios.dashboard-personalizado', nome: 'Dashboard Personalizado', categoria: ModuloCategoria.RELATORIOS, icone: 'Layers', rota: '/relatorios/dashboard-personalizado', ordem: 88, habilitadoPorPadrao: false },
      { codigo: 'administracao.empresas', nome: 'Empresas', categoria: ModuloCategoria.ADMINISTRACAO, icone: 'Building', rota: '/config/empresas', ordem: 90, habilitadoPorPadrao: true },
      { codigo: 'administracao.usuarios', nome: 'Usuários', categoria: ModuloCategoria.ADMINISTRACAO, icone: 'Users', rota: '/config/usuarios', ordem: 91, habilitadoPorPadrao: true },
      { codigo: 'administracao.perfis', nome: 'Perfis de Usuário', categoria: ModuloCategoria.ADMINISTRACAO, icone: 'Shield', rota: '/config/perfis', ordem: 92, habilitadoPorPadrao: true },
      { codigo: 'administracao.filiais', nome: 'Multi-Filiais', categoria: ModuloCategoria.ADMINISTRACAO, icone: 'Building', rota: '/config/filiais', ordem: 93, habilitadoPorPadrao: false },
      { codigo: 'configuracoes.integracoes', nome: 'Integrações', categoria: ModuloCategoria.CONFIGURACOES, icone: 'Cpu', rota: '/config/integracoes', ordem: 100, habilitadoPorPadrao: true },
      { codigo: 'configuracoes.backup', nome: 'Backup e Restore', categoria: ModuloCategoria.CONFIGURACOES, icone: 'Database', rota: '/config/backup', ordem: 101, habilitadoPorPadrao: true },
      { codigo: 'configuracoes.auditoria', nome: 'Auditoria', categoria: ModuloCategoria.CONFIGURACOES, icone: 'History', rota: '/config/auditoria', ordem: 102, habilitadoPorPadrao: true },
      { codigo: 'configuracoes.notificacoes', nome: 'Notificações', categoria: ModuloCategoria.CONFIGURACOES, icone: 'Bell', rota: '/config/notificacoes', ordem: 103, habilitadoPorPadrao: true },
    ];

    const modulosExistentes = await this.moduloRepository.count();
    
    if (modulosExistentes > 0) {
      console.log(`[ModulosSeed] Já existem ${modulosExistentes} módulos no banco. Pulando seed.`);
      return;
    }

    console.log('[ModulosSeed] Populando módulos do sistema...');
    
    for (const moduloData of modulos) {
      const existe = await this.moduloRepository.findOne({
        where: { codigo: moduloData.codigo },
      });

      if (!existe) {
        const modulo = this.moduloRepository.create(moduloData);
        await this.moduloRepository.save(modulo);
        console.log(`[ModulosSeed] Módulo criado: ${moduloData.codigo}`);
      }
    }
    
    console.log(`[ModulosSeed] ${modulos.length} módulos populados com sucesso.`);
  }
}

