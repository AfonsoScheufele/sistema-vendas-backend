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
      console.log(`[PermissoesSeed] Já existem ${permissoesExistentes} permissões no banco. Pulando seed.`);
      return;
    }

    console.log('[PermissoesSeed] Populando permissões do sistema...');

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
          console.log(`[PermissoesSeed] Permissão criada: ${codigo}`);
        }
      }
    }

    console.log('[PermissoesSeed] Permissões populadas com sucesso.');
  }
}

