import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimentacaoEstoque } from './movimentacao-estoque.entity';
import { Lote } from './lote.entity';
import { Produto } from '../produtos/produto.entity';
import { Inventario } from './inventario.entity';
import { AlertaEstoque } from './alerta-estoque.entity';
import { TransferenciaEstoque } from './transferencia-estoque.entity';

@Injectable()
export class EstoqueService {
  constructor(
    @InjectRepository(MovimentacaoEstoque)
    private movimentacaoRepo: Repository<MovimentacaoEstoque>,
    @InjectRepository(Lote)
    private loteRepo: Repository<Lote>,
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
    @InjectRepository(Inventario)
    private inventarioRepo: Repository<Inventario>,
    @InjectRepository(AlertaEstoque)
    private alertaRepo: Repository<AlertaEstoque>,
    @InjectRepository(TransferenciaEstoque)
    private transferenciaRepo: Repository<TransferenciaEstoque>,
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

  async obterInventarioGeral(): Promise<any[]> {
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

  async obterProdutosEstoqueGeral(): Promise<any[]> {
    return await this.produtoRepo.find({
      where: { ativo: true },
      select: ['id', 'nome', 'estoque', 'estoqueMinimo', 'preco', 'categoria'],
      order: { nome: 'ASC' },
    });
  }

  async obterTransferencias(): Promise<any[]> {
    // Por enquanto retorna array vazio, pode ser implementado futuramente
    return [];
  }

  // Inventários
  async listarInventarios(filtros?: any): Promise<Inventario[]> {
    return await this.inventarioRepo.find({
      relations: ['responsavel'],
      order: { createdAt: 'DESC' }
    });
  }

  async criarInventario(createInventarioDto: any): Promise<Inventario> {
    const inventario = this.inventarioRepo.create(createInventarioDto);
    return await this.inventarioRepo.save(inventario) as unknown as Inventario;
  }

  async obterInventario(id: number): Promise<Inventario> {
    const inventario = await this.inventarioRepo.findOne({
      where: { id },
      relations: ['responsavel'],
    });

    if (!inventario) {
      throw new NotFoundException('Inventário não encontrado');
    }

    return inventario;
  }

  async atualizarInventario(id: number, updateInventarioDto: any): Promise<Inventario> {
    const inventario = await this.obterInventario(id);
    
    Object.assign(inventario, updateInventarioDto);
    return await this.inventarioRepo.save(inventario);
  }

  async removerInventario(id: number): Promise<void> {
    const inventario = await this.obterInventario(id);
    await this.inventarioRepo.remove(inventario);
  }

  // Alertas
  async listarAlertas(filtros?: any): Promise<AlertaEstoque[]> {
    const query = this.alertaRepo
      .createQueryBuilder('alerta')
      .leftJoinAndSelect('alerta.produto', 'produto')
      .leftJoinAndSelect('alerta.responsavel', 'responsavel');

    if (filtros?.status) {
      query.where('alerta.status = :status', { status: filtros.status });
    }

    if (filtros?.tipo) {
      query.andWhere('alerta.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros?.nivel) {
      query.andWhere('alerta.nivel = :nivel', { nivel: filtros.nivel });
    }

    return await query
      .orderBy('alerta.dataAlerta', 'DESC')
      .getMany();
  }

  async criarAlerta(createAlertaDto: any): Promise<AlertaEstoque> {
    const alerta = this.alertaRepo.create(createAlertaDto);
    return await this.alertaRepo.save(alerta) as unknown as AlertaEstoque;
  }

  async obterAlerta(id: number): Promise<AlertaEstoque> {
    const alerta = await this.alertaRepo.findOne({
      where: { id },
      relations: ['produto', 'responsavel'],
    });

    if (!alerta) {
      throw new NotFoundException('Alerta não encontrado');
    }

    return alerta;
  }

  async atualizarAlerta(id: number, updateAlertaDto: any): Promise<AlertaEstoque> {
    const alerta = await this.obterAlerta(id);
    
    Object.assign(alerta, updateAlertaDto);
    return await this.alertaRepo.save(alerta);
  }

  async resolverAlerta(id: number): Promise<AlertaEstoque> {
    const alerta = await this.obterAlerta(id);
    alerta.status = 'resolvido';
    return await this.alertaRepo.save(alerta);
  }

  async removerAlerta(id: number): Promise<void> {
    const alerta = await this.obterAlerta(id);
    await this.alertaRepo.remove(alerta);
  }

  // Transferências
  async listarTransferencias(filtros?: any): Promise<TransferenciaEstoque[]> {
    const query = this.transferenciaRepo
      .createQueryBuilder('transferencia')
      .leftJoinAndSelect('transferencia.produto', 'produto')
      .leftJoinAndSelect('transferencia.responsavel', 'responsavel');

    if (filtros?.status) {
      query.where('transferencia.status = :status', { status: filtros.status });
    }

    if (filtros?.produtoId) {
      query.andWhere('transferencia.produtoId = :produtoId', { produtoId: filtros.produtoId });
    }

    return await query
      .orderBy('transferencia.createdAt', 'DESC')
      .getMany();
  }

  async criarTransferencia(createTransferenciaDto: any): Promise<TransferenciaEstoque> {
    const produto = await this.produtoRepo.findOne({ where: { id: createTransferenciaDto.produtoId } });
    
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (produto.estoque < createTransferenciaDto.quantidade) {
      throw new BadRequestException('Estoque insuficiente para transferência');
    }

    const transferencia = this.transferenciaRepo.create({
      ...createTransferenciaDto,
      numero: `TRF-${Date.now()}`,
      valorTotal: createTransferenciaDto.valorUnitario ? 
        createTransferenciaDto.valorUnitario * createTransferenciaDto.quantidade : undefined,
    });

    return await this.transferenciaRepo.save(transferencia) as unknown as TransferenciaEstoque;
  }

  async obterTransferencia(id: number): Promise<TransferenciaEstoque> {
    const transferencia = await this.transferenciaRepo.findOne({
      where: { id },
      relations: ['produto', 'responsavel'],
    });

    if (!transferencia) {
      throw new NotFoundException('Transferência não encontrada');
    }

    return transferencia;
  }

  async atualizarTransferencia(id: number, updateTransferenciaDto: any): Promise<TransferenciaEstoque> {
    const transferencia = await this.obterTransferencia(id);
    
    Object.assign(transferencia, updateTransferenciaDto);
    return await this.transferenciaRepo.save(transferencia);
  }

  async confirmarTransferencia(id: number): Promise<TransferenciaEstoque> {
    const transferencia = await this.obterTransferencia(id);
    
    if (transferencia.status !== 'pendente') {
      throw new BadRequestException('Apenas transferências pendentes podem ser confirmadas');
    }

    // Atualizar estoque do produto
    const produto = await this.produtoRepo.findOne({ where: { id: transferencia.produtoId } });
    produto.estoque -= transferencia.quantidade;
    await this.produtoRepo.save(produto);

    transferencia.status = 'concluida';
    transferencia.dataTransferencia = new Date();
    
    return await this.transferenciaRepo.save(transferencia);
  }

  async removerTransferencia(id: number): Promise<void> {
    const transferencia = await this.obterTransferencia(id);
    await this.transferenciaRepo.remove(transferencia);
  }

  // Produtos em estoque
  async obterProdutosEstoque(filtros?: any): Promise<any[]> {
    const query = this.produtoRepo
      .createQueryBuilder('produto')
      .where('produto.ativo = :ativo', { ativo: true });

    if (filtros?.categoria) {
      query.andWhere('produto.categoria = :categoria', { categoria: filtros.categoria });
    }

    if (filtros?.estoqueBaixo) {
      query.andWhere('produto.estoque <= produto.estoqueMinimo');
    }

    return await query
      .select(['produto.id', 'produto.nome', 'produto.estoque', 'produto.estoqueMinimo', 'produto.preco', 'produto.categoria'])
      .orderBy('produto.nome', 'ASC')
      .getMany();
  }

  async obterEstoqueProduto(id: number): Promise<any> {
    const produto = await this.produtoRepo.findOne({
      where: { id },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return {
      produto: {
        id: produto.id,
        nome: produto.nome,
        estoque: produto.estoque,
        estoqueMinimo: produto.estoqueMinimo,
      },
      lotes: [], // TODO: Implementar relação com lotes
      movimentacoes: await this.listarMovimentacoes({ produtoId: id }),
    };
  }
}

