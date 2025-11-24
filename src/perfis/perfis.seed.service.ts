import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Perfil } from './perfil.entity';

@Injectable()
export class PerfisSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Perfil)
    private readonly perfilRepo: Repository<Perfil>,
  ) {}

  async onModuleInit() {
    try {
      const shouldSeed = (process.env.SEED_PERFIS || 'false') === 'true';
      if (!shouldSeed) return;

      const perfisDefaults: Array<{ nome: string; cor: string; permissoes: string[]; descricao: string }> = [
        {
          nome: 'Admin',
          cor: 'red',
          descricao: 'Acesso total ao sistema',
          permissoes: ['*'],
        },
        {
          nome: 'Gestor',
          cor: 'purple',
          descricao: 'Gestão comercial e operacional',
          permissoes: [
            'dashboard.view',
            'pedidos.view','pedidos.create','pedidos.edit','pedidos.cancel',
            'orcamentos.view','orcamentos.create','orcamentos.edit','orcamentos.delete',
            'produtos.view','produtos.create','produtos.edit','produtos.delete',
            'clientes.view','clientes.create','clientes.edit','clientes.delete',
            'comissoes.view','comissoes.create','comissoes.edit',
            'metas.view','metas.create','metas.edit',
            'pipeline.view','pipeline.edit',
            'estoque.view','movimentacoes.view','transferencias.view','lotes.view','inventario.view',
            'requisicoes.view','cotacoes.view','pedidoscompra.view','fornecedores.view','contratos.view',
            'receber.view','pagar.view','fluxocaixa.view','bancos.view','conciliacao.view',
            'notasfiscais.view','sped.view','impostos.view',
            'planocontas.view',
            'expedicao.view','transportadoras.view','roteiros.view','rastreamento.view',
            'leads.view','oportunidades.view','campanhas.view',
            'relvendas.view','relclientes.view','relestoque.view','relfinanceiro.view','relcompras.view','kpis.view',
            'empresas.view','perfis.view','usuarios.view'
          ],
        },
        {
          nome: 'Vendedor',
          cor: 'blue',
          descricao: 'Foco em vendas e clientes',
          permissoes: [
            'dashboard.view',
            'pedidos.view','pedidos.create','pedidos.edit',
            'orcamentos.view','orcamentos.create','orcamentos.edit',
            'clientes.view','clientes.create','clientes.edit',
            'pipeline.view',
            'relvendas.view'
          ],
        },
        {
          nome: 'Financeiro',
          cor: 'green',
          descricao: 'Contas e relatórios financeiros',
          permissoes: [
            'receber.view','receber.create','receber.edit',
            'pagar.view','pagar.create','pagar.edit',
            'fluxocaixa.view','bancos.view','conciliacao.view',
            'relfinanceiro.view'
          ],
        },
      ];

      for (const p of perfisDefaults) {
        const existing = await this.perfilRepo.findOne({ where: { nome: p.nome } });
        if (!existing) {
          const perfil = this.perfilRepo.create({
            nome: p.nome,
            descricao: p.descricao,
            permissoes: p.permissoes,
            cor: p.cor,
            ativo: true,
          });
          await this.perfilRepo.save(perfil);
          // eslint-disable-next-line no-console
          console.log(`[SeedPerfis] Perfil criado: ${p.nome}`);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[SeedPerfis] Falha ao aplicar seed de perfis:', err);
    }
  }
}
