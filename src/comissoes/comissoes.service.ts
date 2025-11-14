import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComissaoEntity } from './comissao.entity';
import { ComissaoVendedorEntity } from './comissao-vendedor.entity';
import { CreateComissaoDto, CreateComissaoVendedorDto } from './dto/create-comissao.dto';
import { UpdateComissaoDto } from './dto/update-comissao.dto';
import { Produto } from '../produtos/produto.entity';

interface ComissaoFiltros {
  status?: 'ativo' | 'inativo';
  search?: string;
  produtoId?: number;
}

@Injectable()
export class ComissoesService {
  constructor(
    @InjectRepository(ComissaoEntity)
    private readonly comissaoRepo: Repository<ComissaoEntity>,
    @InjectRepository(ComissaoVendedorEntity)
    private readonly vendedorRepo: Repository<ComissaoVendedorEntity>,
    @InjectRepository(Produto)
    private readonly produtoRepo: Repository<Produto>,
  ) {}

  private mapVendedorPayload(
    empresaId: string,
    dto: CreateComissaoVendedorDto,
    comissao?: ComissaoEntity,
  ): ComissaoVendedorEntity {
    return this.vendedorRepo.create({
      empresaId,
      vendedorId: dto.vendedorId,
      vendedorNome: dto.vendedorNome ?? null,
      tipo: dto.tipo,
      percentual: dto.percentual ?? null,
      valorFixo: dto.valorFixo ?? null,
      comissao,
    });
  }

  async listar(empresaId: string, filtros?: ComissaoFiltros) {
    const query = this.comissaoRepo
      .createQueryBuilder('comissao')
      .leftJoinAndSelect('comissao.vendedores', 'vendedores')
      .leftJoinAndSelect('comissao.produto', 'produto')
      .where('comissao.empresaId = :empresaId', { empresaId });

    if (filtros?.status) {
      query.andWhere('comissao.ativo = :status', {
        status: filtros.status === 'ativo',
      });
    }

    if (filtros?.produtoId) {
      query.andWhere('comissao.produtoId = :produtoId', { produtoId: filtros.produtoId });
    }

    if (filtros?.search) {
      const termo = `%${filtros.search.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(COALESCE(produto.nome, \'\')) LIKE :termo OR LOWER(comissao.id::text) LIKE :termo)',
        { termo },
      );
    }

    const comissoes = await query.orderBy('comissao.updatedAt', 'DESC').getMany();
    return comissoes.map((comissao) => this.mapToResponse(comissao));
  }

  async obterPorId(id: string, empresaId: string) {
    const comissao = await this.comissaoRepo.findOne({
      where: { id, empresaId },
      relations: ['vendedores', 'produto'],
    });
    if (!comissao) {
      throw new NotFoundException('Comissão não encontrada');
    }
    return this.mapToResponse(comissao);
  }

  async criar(empresaId: string, dto: CreateComissaoDto) {
    const produto = await this.produtoRepo.findOne({ where: { id: dto.produtoId, empresaId } });

    const comissao = this.comissaoRepo.create({
      empresaId,
      produtoId: dto.produtoId,
      produto: produto ?? null,
      tipoComissaoBase: dto.tipoComissaoBase,
      comissaoBase: dto.comissaoBase,
      comissaoMinima: dto.comissaoMinima,
      comissaoMaxima: dto.comissaoMaxima ?? null,
      ativo: dto.ativo ?? true,
      vendedores: (dto.vendedores ?? []).map((vendedorDto) =>
        this.mapVendedorPayload(empresaId, vendedorDto),
      ),
    });

    const salvo = await this.comissaoRepo.save(comissao);
    return this.obterPorId(salvo.id, empresaId);
  }

  async atualizar(id: string, empresaId: string, dto: UpdateComissaoDto) {
    const comissao = await this.comissaoRepo.findOne({
      where: { id, empresaId },
      relations: ['vendedores', 'produto'],
    });
    if (!comissao) {
      throw new NotFoundException('Comissão não encontrada');
    }

    if (dto.produtoId && dto.produtoId !== comissao.produtoId) {
      const produto = await this.produtoRepo.findOne({
        where: { id: dto.produtoId, empresaId },
      });
      comissao.produtoId = dto.produtoId;
      comissao.produto = produto ?? null;
    }

    if (dto.tipoComissaoBase) comissao.tipoComissaoBase = dto.tipoComissaoBase;
    if (dto.comissaoBase !== undefined) comissao.comissaoBase = dto.comissaoBase;
    if (dto.comissaoMinima !== undefined) comissao.comissaoMinima = dto.comissaoMinima;
    if (dto.comissaoMaxima !== undefined) {
      comissao.comissaoMaxima = dto.comissaoMaxima ?? null;
    }
    if (dto.ativo !== undefined) comissao.ativo = dto.ativo;

    if (dto.vendedores) {
      await this.vendedorRepo
        .createQueryBuilder()
        .delete()
        .where('comissao_id = :comissaoId', { comissaoId: comissao.id })
        .execute();

      comissao.vendedores = dto.vendedores.map((vendedorDto) =>
        this.mapVendedorPayload(empresaId, vendedorDto, comissao),
      );
    }

    await this.comissaoRepo.save(comissao);
    return this.obterPorId(id, empresaId);
  }

  async remover(id: string, empresaId: string) {
    const comissao = await this.comissaoRepo.findOne({
      where: { id, empresaId },
    });
    if (!comissao) {
      throw new NotFoundException('Comissão não encontrada');
    }
    await this.comissaoRepo.remove(comissao);
  }

  async obterEstatisticas(empresaId: string) {
    const comissoes = await this.comissaoRepo.find({
      where: { empresaId },
    });

    if (!comissoes.length) {
      return {
        totalComissoes: 0,
        comissoesAtivas: 0,
        comissoesInativas: 0,
        comissaoMedia: 0,
        comissaoMediaPercentual: 0,
        totalVendedores: 0,
      };
    }

    const totalComissoes = comissoes.length;
    const comissoesAtivas = comissoes.filter((c) => c.ativo).length;
    const comissaoMedia =
      comissoes.reduce((acc, c) => acc + Number(c.comissaoBase ?? 0), 0) / totalComissoes;
    const percentuais = comissoes.filter((c) => c.tipoComissaoBase === 'percentual');
    const comissaoMediaPercentual =
      percentuais.reduce((acc, c) => acc + Number(c.comissaoBase ?? 0), 0) /
      Math.max(percentuais.length, 1);
    const totalVendedores = comissoes.reduce(
      (acc, c) => acc + (c.vendedores?.length ?? 0),
      0,
    );

    return {
      totalComissoes,
      comissoesAtivas,
      comissoesInativas: totalComissoes - comissoesAtivas,
      comissaoMedia: Number(comissaoMedia.toFixed(2)),
      comissaoMediaPercentual: Number(comissaoMediaPercentual.toFixed(2)),
      totalVendedores,
    };
  }

  private mapToResponse(entity: ComissaoEntity) {
    return {
      id: entity.id,
      produtoId: entity.produtoId,
      produto: entity.produto
        ? {
            id: entity.produto.id,
            nome: entity.produto.nome,
            categoria: entity.produto.categoria,
            preco: Number(entity.produto.preco ?? 0),
            ativo: entity.produto.ativo,
          }
        : null,
      tipoComissaoBase: entity.tipoComissaoBase,
      comissaoBase: Number(entity.comissaoBase ?? 0),
      comissaoMinima: Number(entity.comissaoMinima ?? 0),
      comissaoMaxima:
        entity.comissaoMaxima === null || entity.comissaoMaxima === undefined
          ? null
          : Number(entity.comissaoMaxima),
      ativo: entity.ativo,
      vendedores: (entity.vendedores ?? []).map((vendedor) => ({
        id: vendedor.id,
        vendedorId: vendedor.vendedorId,
        vendedorNome: vendedor.vendedorNome,
        tipo: vendedor.tipo,
        percentual:
          vendedor.percentual === null || vendedor.percentual === undefined
            ? null
            : Number(vendedor.percentual),
        valorFixo:
          vendedor.valorFixo === null || vendedor.valorFixo === undefined
            ? null
            : Number(vendedor.valorFixo),
      })),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

