import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissaoEntity } from './permissao.entity';
import { ModuloEntity } from '../configuracoes/modulo.entity';

@Injectable()
export class PermissoesSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(PermissaoEntity)
    private readonly permissaoRepository: Repository<PermissaoEntity>,
    @InjectRepository(ModuloEntity)
    private readonly moduloRepository: Repository<ModuloEntity>,
  ) {}

  async onModuleInit() {
    const permissoesExistentes = await this.permissaoRepository.count();
    if (permissoesExistentes > 0) {
      return;
    }


    const modulos = await this.moduloRepository.find();

    const tiposPermissoes = [
      { tipo: 'view', nome: 'Visualizar', ordem: 1 },
      { tipo: 'create', nome: 'Criar', ordem: 2 },
      { tipo: 'edit', nome: 'Editar', ordem: 3 },
      { tipo: 'delete', nome: 'Excluir', ordem: 4 },
    ];

    for (const modulo of modulos) {
      for (const tipoPerm of tiposPermissoes) {
        const codigo = `${modulo.codigo}.${tipoPerm.tipo}`;
        const nome = `${tipoPerm.nome} ${modulo.nome}`;
        const descricao = `Permite ${tipoPerm.nome.toLowerCase()} ${modulo.nome.toLowerCase()}`;

        const existe = await this.permissaoRepository.findOne({
          where: { codigo },
        });

        if (!existe) {
          const permissao = this.permissaoRepository.create({
            codigo,
            nome,
            descricao,
            moduloId: modulo.id,
            tipo: tipoPerm.tipo,
            ordem: tipoPerm.ordem,
            ativo: true,
          });
          await this.permissaoRepository.save(permissao);
        }
      }
    }

    const moduloVendas = await this.moduloRepository.findOne({ where: { codigo: 'vendas' } });
    const moduloEstoque = await this.moduloRepository.findOne({ where: { codigo: 'estoque' } });

    const moduloConfiguracoes = await this.moduloRepository.findOne({ where: { codigo: 'configuracoes' } });

    const permissoesEspeciais = [
      {
        codigo: 'pedidos.notificacao',
        nome: 'Receber Notificações de Pedidos',
        descricao: 'Permite receber notificações quando novos pedidos são criados',
        tipo: 'notificacao',
        ordem: 1,
        moduloId: moduloVendas?.id || null,
      },
      {
        codigo: 'estoque.baixo',
        nome: 'Receber Notificações de Estoque Baixo',
        descricao: 'Permite receber notificações quando produtos ficam com estoque baixo ou sem estoque',
        tipo: 'notificacao',
        ordem: 2,
        moduloId: moduloEstoque?.id || null,
      },
      {
        codigo: 'configuracoes.estoque',
        nome: 'Configurar Estoque',
        descricao: 'Permite configurar alertas e notificações de estoque',
        tipo: 'edit',
        ordem: 3,
        moduloId: moduloConfiguracoes?.id || null,
      },
    ];

    for (const permissaoEspecial of permissoesEspeciais) {
      const existe = await this.permissaoRepository.findOne({
        where: { codigo: permissaoEspecial.codigo },
      });

      if (!existe && permissaoEspecial.moduloId) {
        const permissao = this.permissaoRepository.create({
          codigo: permissaoEspecial.codigo,
          nome: permissaoEspecial.nome,
          descricao: permissaoEspecial.descricao,
          tipo: permissaoEspecial.tipo,
          ordem: permissaoEspecial.ordem,
          moduloId: permissaoEspecial.moduloId,
          ativo: true,
        });
        await this.permissaoRepository.save(permissao);
      } else if (!existe) {
        console.warn(`[PermissoesSeed] Não foi possível criar ${permissaoEspecial.codigo}: módulo não encontrado`);
      }
    }

  }
}

