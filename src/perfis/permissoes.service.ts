import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissaoEntity } from './permissao.entity';
import { PerfilPermissaoEntity } from './perfil-permissao.entity';
import { Perfil } from './perfil.entity';

@Injectable()
export class PermissoesService {
  constructor(
    @InjectRepository(PermissaoEntity)
    private readonly permissaoRepository: Repository<PermissaoEntity>,
    @InjectRepository(PerfilPermissaoEntity)
    private readonly perfilPermissaoRepository: Repository<PerfilPermissaoEntity>,
  ) {}

  async listarPermissoes(): Promise<PermissaoEntity[]> {
    return this.permissaoRepository.find({
      where: { ativo: true },
      relations: ['modulo'],
      order: { modulo: { ordem: 'ASC' }, ordem: 'ASC', nome: 'ASC' },
    });
  }

  async listarPermissoesPorModulo(moduloId: number): Promise<PermissaoEntity[]> {
    return this.permissaoRepository.find({
      where: { moduloId, ativo: true },
      order: { ordem: 'ASC', nome: 'ASC' },
    });
  }

  async obterPermissoesDoPerfil(perfilId: number): Promise<string[]> {
    const perfilPermissoes = await this.perfilPermissaoRepository.find({
      where: { perfilId, habilitado: true },
      relations: ['permissao'],
    });
    return perfilPermissoes.map((pp) => pp.permissao.codigo);
  }

  async atualizarPermissoesDoPerfil(perfilId: number, codigosPermissoes: string[]): Promise<void> {
    await this.perfilPermissaoRepository.delete({ perfilId });

    for (const codigo of codigosPermissoes) {
      const permissao = await this.permissaoRepository.findOne({ where: { codigo } });
      if (permissao) {
        const perfilPermissao = this.perfilPermissaoRepository.create({
          perfilId,
          permissaoId: permissao.id,
          habilitado: true,
        });
        await this.perfilPermissaoRepository.save(perfilPermissao);
      }
    }
  }

  async verificarPermissao(perfilId: number, codigoPermissao: string): Promise<boolean> {
    const permissao = await this.permissaoRepository.findOne({ where: { codigo: codigoPermissao } });
    if (!permissao) return false;

    const perfilPermissao = await this.perfilPermissaoRepository.findOne({
      where: { perfilId, permissaoId: permissao.id, habilitado: true },
    });

    return !!perfilPermissao;
  }
}

