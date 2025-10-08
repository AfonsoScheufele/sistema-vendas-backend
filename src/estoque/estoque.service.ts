import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimentacaoEstoque } from './movimentacao-estoque.entity';
import { Lote } from './lote.entity';
import { Produto } from '../produtos/produto.entity';

@Injectable()
export class EstoqueService {
  constructor(
    @InjectRepository(MovimentacaoEstoque)
    private movimentacaoRepo: Repository<MovimentacaoEstoque>,
    @InjectRepository(Lote)
    private loteRepo: Repository<Lote>,
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
  ) {}

  // Movimentações de Estoque
  async criarMovimentacao(createMovimentacaoDto: any): Promise<MovimentacaoEstoque> {
    const produto = await this.produtoRepo.findOne({ where: { id: createMovimentacaoDto.produtoId } });
    
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    const movimentacao = this.movimentacaoRepo.create({
      ...createMovimentacaoDto,
      valorTotal: createMovimentacaoDto.valorUnitario ? 
        createMovimentacaoDto.valorUnitario * createMovimentacaoDto.quantidade : undefined,
    });

    // Atualizar estoque do produto
    if (createMovimentacaoDto.tipo === 'entrada' || createMovimentacaoDto.tipo === 'ajuste') {
      produto.estoque += createMovimentacaoDto.quantidade;
    } else if (createMovimentacaoDto.tipo === 'saida') {
      if (produto.estoque < createMovimentacaoDto.quantidade) {
        throw new BadRequestException('Estoque insuficiente');
      }
      produto.estoque -= createMovimentacaoDto.quantidade;
    }

    await this.produtoRepo.save(produto);
    return await this.movimentacaoRepo.save(movimentacao) as unknown as MovimentacaoEstoque;
  }

  async listarMovimentacoes(filtros?: any): Promise<MovimentacaoEstoque[]> {
    const query = this.movimentacaoRepo
      .createQueryBuilder('movimentacao')
      .leftJoinAndSelect('movimentacao.produto', 'produto');

    if (filtros?.produtoId) {
      query.where('movimentacao.produtoId = :produtoId', { produtoId: filtros.produtoId });
    }

    if (filtros?.tipo) {
      query.andWhere('movimentacao.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros?.dataInicio && filtros?.dataFim) {
      query.andWhere('movimentacao.dataMovimentacao BETWEEN :dataInicio AND :dataFim', {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
    }

    return await query
      .orderBy('movimentacao.dataMovimentacao', 'DESC')
      .getMany();
  }

  // Gestão de Lotes
  async criarLote(createLoteDto: any): Promise<Lote> {
    const produto = await this.produtoRepo.findOne({ where: { id: createLoteDto.produtoId } });
    
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    const lote = this.loteRepo.create({
      ...createLoteDto,
      quantidadeDisponivel: createLoteDto.quantidade,
    });

    return await this.loteRepo.save(lote) as unknown as Lote;
  }

  async listarLotes(filtros?: any): Promise<Lote[]> {
    const query = this.loteRepo
      .createQueryBuilder('lote')
      .leftJoinAndSelect('lote.produto', 'produto');

    if (filtros?.produtoId) {
      query.where('lote.produtoId = :produtoId', { produtoId: filtros.produtoId });
    }

    if (filtros?.vencimentoProximo) {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + 30); // 30 dias
      query.andWhere('lote.dataValidade <= :dataLimite', { dataLimite });
    }

    return await query
      .orderBy('lote.dataValidade', 'ASC')
      .getMany();
  }

  async obterInventario(): Promise<any[]> {
    return await this.produtoRepo
      .createQueryBuilder('produto')
      .leftJoinAndSelect('produto.lotes', 'lote')
      .where('produto.ativo = :ativo', { ativo: true })
      .orderBy('produto.nome', 'ASC')
      .getMany();
  }

  async obterAlertasEstoque(): Promise<any[]> {
    const produtos = await this.produtoRepo.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });

    const alertas = [];

    for (const produto of produtos) {
      // Estoque baixo
      if (produto.estoque <= 10) {
        alertas.push({
          tipo: 'estoque_baixo',
          produto: produto.nome,
          estoqueAtual: produto.estoque,
          mensagem: `Estoque baixo: ${produto.estoque} unidades`,
        });
      }

      // Produto sem estoque
      if (produto.estoque === 0) {
        alertas.push({
          tipo: 'sem_estoque',
          produto: produto.nome,
          estoqueAtual: produto.estoque,
          mensagem: 'Produto sem estoque',
        });
      }
    }

    // Lotes próximos do vencimento
    const lotesVencendo = await this.loteRepo
      .createQueryBuilder('lote')
      .leftJoinAndSelect('lote.produto', 'produto')
      .where('lote.dataValidade <= :dataLimite', { 
        dataLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      })
      .andWhere('lote.ativo = :ativo', { ativo: true })
      .getMany();

    for (const lote of lotesVencendo) {
      alertas.push({
        tipo: 'vencimento_proximo',
        produto: lote.produto.nome,
        lote: lote.numero,
        dataValidade: lote.dataValidade,
        mensagem: `Lote ${lote.numero} vence em ${Math.ceil((lote.dataValidade.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias`,
      });
    }

    return alertas;
  }
}

