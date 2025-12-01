import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstoqueDepositoEntity } from './entities/estoque-deposito.entity';
import { EstoqueMovimentacaoEntity } from './entities/estoque-movimentacao.entity';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { UpdateDepositoDto } from './dto/update-deposito.dto';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { ProdutosService } from '../produtos/produtos.service';

@Injectable()
export class EstoqueService {
  constructor(
    @InjectRepository(EstoqueDepositoEntity)
    private readonly depositoRepo: Repository<EstoqueDepositoEntity>,
    @InjectRepository(EstoqueMovimentacaoEntity)
    private readonly movimentacaoRepo: Repository<EstoqueMovimentacaoEntity>,
    private readonly produtosService: ProdutosService,
  ) {}


  async listarDepositos(empresaId: string) {
    const depositos = await this.depositoRepo.find({
      where: { empresaId },
      order: { nome: 'ASC' },
    });
    return depositos.map((deposito) => this.mapDeposito(deposito));
  }

  async obterDepositoPorId(id: string, empresaId: string) {
    const deposito = await this.depositoRepo.findOne({ where: { id, empresaId } });
    if (!deposito) {
      throw new NotFoundException('Depósito não encontrado');
    }
    return this.mapDeposito(deposito);
  }

  async criarDeposito(dto: CreateDepositoDto, empresaId: string) {
    const deposito = this.depositoRepo.create({
      empresaId,
      nome: dto.nome,
      descricao: dto.descricao ?? null,
      tipo: dto.tipo,
      status: dto.status ?? 'ativo',
      endereco: dto.endereco ?? null,
    });
    const salvo = await this.depositoRepo.save(deposito);
    return this.mapDeposito(salvo);
  }

  async atualizarDeposito(id: string, empresaId: string, dto: UpdateDepositoDto) {
    const deposito = await this.depositoRepo.findOne({ where: { id, empresaId } });
    if (!deposito) {
      throw new NotFoundException('Depósito não encontrado');
    }

    deposito.nome = dto.nome ?? deposito.nome;
    deposito.descricao = dto.descricao ?? deposito.descricao;
    deposito.tipo = dto.tipo ?? deposito.tipo;
    deposito.status = dto.status ?? deposito.status;
    deposito.endereco = dto.endereco ?? deposito.endereco;

    await this.depositoRepo.save(deposito);
    return this.mapDeposito(deposito);
  }

  async removerDeposito(id: string, empresaId: string) {
    const resultado = await this.depositoRepo.delete({ id, empresaId });
    if (!resultado.affected) {
      throw new NotFoundException('Depósito não encontrado');
    }
  }

  async registrarMovimentacao(dto: CreateMovimentacaoDto, empresaId: string) {
    const produto = await this.produtosService.findOne(dto.produtoId, empresaId);

    let depositoOrigem: EstoqueDepositoEntity | null = null;
    let depositoDestino: EstoqueDepositoEntity | null = null;

    if (dto.depositoOrigemId) {
      depositoOrigem = await this.depositoRepo.findOne({
        where: { id: dto.depositoOrigemId, empresaId },
      });
      if (!depositoOrigem) {
        throw new NotFoundException('Depósito de origem não encontrado');
      }
    }

    if (dto.depositoDestinoId) {
      depositoDestino = await this.depositoRepo.findOne({
        where: { id: dto.depositoDestinoId, empresaId },
      });
      if (!depositoDestino) {
        throw new NotFoundException('Depósito de destino não encontrado');
      }
    }

    if (dto.tipo === 'transferencia' && (!depositoOrigem || !depositoDestino)) {
      throw new NotFoundException('Transferência requer depósitos de origem e destino');
    }

    if (dto.tipo === 'saida' || dto.tipo === 'transferencia') {
      await this.produtosService.updateEstoque(dto.produtoId, empresaId, dto.quantidade, 'saida');
    } else {
      await this.produtosService.updateEstoque(dto.produtoId, empresaId, dto.quantidade, 'entrada');
    }

    const movimentacao = this.movimentacaoRepo.create({
      empresaId,
      produtoId: produto.id,
      tipo: dto.tipo,
      quantidade: dto.quantidade,
      custoUnitario: dto.custoUnitario ?? null,
      observacao: dto.observacao ?? null,
      referencia: dto.referencia ?? null,
      depositoOrigemId: depositoOrigem?.id ?? null,
      depositoDestinoId: depositoDestino?.id ?? null,
    });

    const salvo = await this.movimentacaoRepo.save(movimentacao);
    return this.mapMovimentacao(await this.movimentacaoRepo.findOne({ where: { id: salvo.id } }));
  }

  async listarMovimentacoes(empresaId: string, filtros?: { produtoId?: number; tipo?: string }) {
    const query = this.movimentacaoRepo
      .createQueryBuilder('mov')
      .leftJoinAndSelect('mov.produto', 'produto')
      .leftJoinAndSelect('mov.depositoOrigem', 'depositoOrigem')
      .leftJoinAndSelect('mov.depositoDestino', 'depositoDestino')
      .where('mov.empresaId = :empresaId', { empresaId });

    if (filtros?.produtoId) {
      query.andWhere('mov.produtoId = :produtoId', { produtoId: filtros.produtoId });
    }

    if (filtros?.tipo) {
      query.andWhere('mov.tipo = :tipo', { tipo: filtros.tipo });
    }

    const movimentacoes = await query.orderBy('mov.criadoEm', 'DESC').getMany();
    return movimentacoes.map((mov) => this.mapMovimentacao(mov));
  }

  async obterEstatisticas(empresaId: string) {
    const totalMovimentacoes = await this.movimentacaoRepo.count({ where: { empresaId } });
    const entradas = await this.movimentacaoRepo.count({
      where: { empresaId, tipo: 'entrada' },
    });
    const saidas = await this.movimentacaoRepo.count({
      where: { empresaId, tipo: 'saida' },
    });
    const transferencias = await this.movimentacaoRepo.count({
      where: { empresaId, tipo: 'transferencia' },
    });

    const estoqueBaixo = await this.produtosService.getEstoqueBaixo(empresaId);

    return {
      totalMovimentacoes,
      entradas,
      saidas,
      transferencias,
      produtosEstoqueBaixo: estoqueBaixo.map((produto) => ({
        id: produto.id,
        nome: produto.nome,
        estoque: produto.estoque,
        estoqueMinimo: produto.estoqueMinimo,
      })),
    };
  }

  private mapDeposito(entity: EstoqueDepositoEntity) {
    return {
      id: entity.id,
      empresaId: entity.empresaId,
      nome: entity.nome,
      descricao: entity.descricao ?? undefined,
      tipo: entity.tipo,
      status: entity.status as 'ativo' | 'inativo',
      endereco: entity.endereco ?? undefined,
      criadoEm: entity.criadoEm,
      atualizadoEm: entity.atualizadoEm,
    };
  }

  private mapMovimentacao(entity: EstoqueMovimentacaoEntity | null) {
    if (!entity) return null;
    return {
      id: entity.id,
      empresaId: entity.empresaId,
      tipo: entity.tipo,
      quantidade: entity.quantidade,
      custoUnitario: entity.custoUnitario ? Number(entity.custoUnitario) : null,
      observacao: entity.observacao ?? null,
      referencia: entity.referencia ?? null,
      criadoEm: entity.criadoEm,
      produto: entity.produto
        ? {
            id: entity.produto.id,
            nome: entity.produto.nome,
            sku: entity.produto.sku,
            estoque: entity.produto.estoque,
          }
        : null,
      depositoOrigem: entity.depositoOrigem
        ? { id: entity.depositoOrigem.id, nome: entity.depositoOrigem.nome }
        : null,
      depositoDestino: entity.depositoDestino
        ? { id: entity.depositoDestino.id, nome: entity.depositoDestino.nome }
        : null,
    };
  }
}


