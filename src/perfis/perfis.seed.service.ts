import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Perfil } from './perfil.entity';
import { PermissaoEntity } from './permissao.entity';

@Injectable()
export class PerfisSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Perfil)
    private readonly perfilRepo: Repository<Perfil>,
    @InjectRepository(PermissaoEntity)
    private readonly permissaoRepo: Repository<PermissaoEntity>,
  ) {}

  async onModuleInit() {
    try {
      await this.migrarPermissoesAntigas();
      await this.criarPerfilAdmin();
    } catch (error) {
      console.error('[PerfisSeedService] Erro ao executar seed:', error);
    }
  }

  private async migrarPermissoesAntigas() {
    const perfis = await this.perfilRepo.find();
    const todasPermissoes = await this.permissaoRepo.find({ where: { ativo: true } });
    const permissoesMap = new Map(todasPermissoes.map(p => [p.codigo, p]));

    const mapeamento: Record<string, string> = {
      'dashboard.view': 'dashboard.view',
      'clientes.view': 'cadastros.clientes.view',
      'clientes.create': 'cadastros.clientes.create',
      'clientes.edit': 'cadastros.clientes.edit',
      'clientes.delete': 'cadastros.clientes.delete',
      'produtos.view': 'cadastros.produtos.view',
      'produtos.create': 'cadastros.produtos.create',
      'produtos.edit': 'cadastros.produtos.edit',
      'produtos.delete': 'cadastros.produtos.delete',
      'fornecedores.view': 'cadastros.fornecedores.view',
      'fornecedores.create': 'cadastros.fornecedores.create',
      'fornecedores.edit': 'cadastros.fornecedores.edit',
      'fornecedores.delete': 'cadastros.fornecedores.delete',
      'pedidos.view': 'vendas.pedidos.view',
      'pedidos.create': 'vendas.pedidos.create',
      'pedidos.edit': 'vendas.pedidos.edit',
      'pedidos.delete': 'vendas.pedidos.delete',
      'orcamentos.view': 'vendas.orcamentos.view',
      'orcamentos.create': 'vendas.orcamentos.create',
      'orcamentos.edit': 'vendas.orcamentos.edit',
      'orcamentos.delete': 'vendas.orcamentos.delete',
      'pipeline.view': 'vendas.pipeline.view',
      'pipeline.edit': 'vendas.pipeline.edit',
      'comissoes.view': 'vendas.comissoes.view',
      'comissoes.create': 'vendas.comissoes.create',
      'comissoes.edit': 'vendas.comissoes.edit',
      'comissoes.delete': 'vendas.comissoes.delete',
      'metas.view': 'vendas.metas.view',
      'metas.create': 'vendas.metas.create',
      'metas.edit': 'vendas.metas.edit',
      'estoque.view': 'estoque.produtos.view',
      'estoque.create': 'estoque.produtos.create',
      'estoque.edit': 'estoque.produtos.edit',
      'movimentacoes.view': 'estoque.movimentacoes.view',
      'movimentacoes.create': 'estoque.movimentacoes.create',
      'movimentacoes.edit': 'estoque.movimentacoes.edit',
      'transferencias.view': 'estoque.transferencias.view',
      'transferencias.create': 'estoque.transferencias.create',
      'lotes.view': 'estoque.lotes.view',
      'lotes.create': 'estoque.lotes.create',
      'inventario.view': 'estoque.inventario.view',
      'inventario.create': 'estoque.inventario.create',
      'alertas.view': 'estoque.alertas.view',
      'requisicoes.view': 'compras.requisicoes.view',
      'requisicoes.create': 'compras.requisicoes.create',
      'requisicoes.edit': 'compras.requisicoes.edit',
      'cotacoes.view': 'compras.cotacoes.view',
      'cotacoes.create': 'compras.cotacoes.create',
      'cotacoes.edit': 'compras.cotacoes.edit',
      'pedidoscompra.view': 'compras.pedidos.view',
      'pedidoscompra.create': 'compras.pedidos.create',
      'pedidoscompra.edit': 'compras.pedidos.edit',
      'contratos.view': 'compras.contratos.view',
      'contratos.create': 'compras.contratos.create',
      'contratos.edit': 'compras.contratos.edit',
      'receber.view': 'financeiro.receber.view',
      'receber.create': 'financeiro.receber.create',
      'receber.edit': 'financeiro.receber.edit',
      'pagar.view': 'financeiro.pagar.view',
      'pagar.create': 'financeiro.pagar.create',
      'pagar.edit': 'financeiro.pagar.edit',
      'fluxocaixa.view': 'financeiro.fluxo.view',
      'bancos.view': 'financeiro.bancos.view',
      'conciliacao.view': 'financeiro.conciliacao.view',
      'orcamento.view': 'financeiro.orcamento.view',
      'notasfiscais.view': 'fiscal.notas.view',
      'notasfiscais.create': 'fiscal.notas.create',
      'notasfiscais.edit': 'fiscal.notas.edit',
      'sped.view': 'fiscal.sped.view',
      'impostos.view': 'fiscal.impostos.view',
      'relatorios.view': 'contabil.relatorios.view',
      'expedicao.view': 'logistica.expedicao.view',
      'expedicao.create': 'logistica.expedicao.create',
      'expedicao.edit': 'logistica.expedicao.edit',
      'transportadoras.view': 'logistica.transportadoras.view',
      'transportadoras.create': 'logistica.transportadoras.create',
      'transportadoras.edit': 'logistica.transportadoras.edit',
      'rastreamento.view': 'logistica.rastreamento.view',
      'leads.view': 'crm.leads.view',
      'leads.create': 'crm.leads.create',
      'leads.edit': 'crm.leads.edit',
      'leads.delete': 'crm.leads.delete',
      'oportunidades.view': 'crm.oportunidades.view',
      'oportunidades.create': 'crm.oportunidades.create',
      'oportunidades.edit': 'crm.oportunidades.edit',
      'campanhas.view': 'crm.campanhas.view',
      'campanhas.create': 'crm.campanhas.create',
      'campanhas.edit': 'crm.campanhas.edit',
      'email.view': 'crm.email.view',
      'automacao.view': 'crm.automacao.view',
      'analytics.view': 'relatorios.analytics.view',
      'relvendas.view': 'relatorios.vendas.view',
      'relclientes.view': 'relatorios.clientes.view',
      'relestoque.view': 'relatorios.estoque.view',
      'relfinanceiro.view': 'relatorios.financeiro.view',
      'relcompras.view': 'relatorios.compras.view',
      'kpis.view': 'relatorios.kpis.view',
      'export.view': 'relatorios.exportacao.view',
      'empresas.view': 'administracao.empresas.view',
      'empresas.create': 'administracao.empresas.create',
      'empresas.edit': 'administracao.empresas.edit',
      'empresas.delete': 'administracao.empresas.delete',
      'usuarios.view': 'administracao.usuarios.view',
      'usuarios.create': 'administracao.usuarios.create',
      'usuarios.edit': 'administracao.usuarios.edit',
      'usuarios.delete': 'administracao.usuarios.delete',
      'perfis.view': 'administracao.perfis.view',
      'perfis.create': 'administracao.perfis.create',
      'perfis.edit': 'administracao.perfis.edit',
      'perfis.delete': 'administracao.perfis.delete',
      'filiais.view': 'administracao.filiais.view',
      'integracoes.view': 'configuracoes.integracoes.view',
      'backup.view': 'configuracoes.backup.view',
      'auditoria.view': 'configuracoes.auditoria.view',
      'notificacoes.view': 'configuracoes.notificacoes.view',
      'pdf.edit': 'configuracoes.pdf.edit',
      'configuracoes.estoque': 'configuracoes.estoque.view',
      'configuracoes.view': 'configuracoes.integracoes.view',
      'estoque.baixo': 'estoque.produtos.baixo',
      'pedidos.notificacao': 'vendas.pedidos.notificacao',
    };

    for (const perfil of perfis) {
      const novasPermissoes: string[] = [];
      const permissoesProcessadas = new Set<string>();

      for (const permissaoAntiga of perfil.permissoes || []) {
        const novaPermissao = mapeamento[permissaoAntiga];
        if (novaPermissao && permissoesMap.has(novaPermissao) && !permissoesProcessadas.has(novaPermissao)) {
          novasPermissoes.push(novaPermissao);
          permissoesProcessadas.add(novaPermissao);
        } else if (!mapeamento[permissaoAntiga] && permissoesMap.has(permissaoAntiga) && !permissoesProcessadas.has(permissaoAntiga)) {
          novasPermissoes.push(permissaoAntiga);
          permissoesProcessadas.add(permissaoAntiga);
        }
      }

      if (novasPermissoes.length !== perfil.permissoes.length || novasPermissoes.some((p, i) => p !== perfil.permissoes[i])) {
        perfil.permissoes = novasPermissoes;
        await this.perfilRepo.save(perfil);
      }
    }
  }

  private async criarPerfilAdmin() {
    const adminExistente = await this.perfilRepo.findOne({ where: { nome: 'Admin' } });
    
    if (!adminExistente) {
      const todasPermissoes = await this.permissaoRepo.find({ where: { ativo: true } });
      const codigosPermissoes = todasPermissoes.map(p => p.codigo);

      const adminPerfil = this.perfilRepo.create({
        nome: 'Admin',
        descricao: 'Perfil administrativo com acesso total ao sistema',
        permissoes: codigosPermissoes,
        ativo: true,
        cor: 'red',
      });

      await this.perfilRepo.save(adminPerfil);
    } else {
      const todasPermissoes = await this.permissaoRepo.find({ where: { ativo: true } });
      const codigosPermissoes = todasPermissoes.map(p => p.codigo);
      const permissoesAtuais = new Set(adminExistente.permissoes || []);
      const permissoesFaltantes = codigosPermissoes.filter(p => !permissoesAtuais.has(p));
      if (permissoesFaltantes.length > 0) {
        adminExistente.permissoes = [...adminExistente.permissoes, ...permissoesFaltantes];
        await this.perfilRepo.save(adminExistente);
      }
    }
  }
}
