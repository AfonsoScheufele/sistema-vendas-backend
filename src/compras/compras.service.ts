import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoCompra } from './pedido-compra.entity';
import { AvaliacaoFornecedor } from './avaliacao-fornecedor.entity';
import { ContratoFornecedor } from './contrato-fornecedor.entity';
import { Fornecedor } from '../fornecedores/fornecedor.entity';
import { Usuario } from '../auth/usuario.entity';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(PedidoCompra)
    private pedidoRepo: Repository<PedidoCompra>,
    @InjectRepository(AvaliacaoFornecedor)
    private avaliacaoRepo: Repository<AvaliacaoFornecedor>,
    @InjectRepository(ContratoFornecedor)
    private contratoRepo: Repository<ContratoFornecedor>,
    @InjectRepository(Fornecedor)
    private fornecedorRepo: Repository<Fornecedor>,
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
  ) {}

  
  async listarPedidosCompra(filtros?: any): Promise<PedidoCompra[]> {
    const query = this.pedidoRepo
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.fornecedor', 'fornecedor')
      .leftJoinAndSelect('pedido.responsavel', 'responsavel');

    if (filtros?.status) {
      query.where('pedido.status = :status', { status: filtros.status });
    }

    if (filtros?.fornecedorId) {
      query.andWhere('pedido.fornecedorId = :fornecedorId', { fornecedorId: filtros.fornecedorId });
    }

    if (filtros?.responsavelId) {
      query.andWhere('pedido.responsavelId = :responsavelId', { responsavelId: filtros.responsavelId });
    }

    return await query
      .orderBy('pedido.createdAt', 'DESC')
      .getMany();
  }

  async criarPedidoCompra(createPedidoDto: any): Promise<PedidoCompra> {
    const fornecedor = await this.fornecedorRepo.findOne({ where: { id: createPedidoDto.fornecedorId } });
    
    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    const pedido = this.pedidoRepo.create({
      ...createPedidoDto,
      numero: `PC-${Date.now()}`,
    });

    return await this.pedidoRepo.save(pedido) as unknown as PedidoCompra;
  }

  async obterPedidoCompra(id: number): Promise<PedidoCompra> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
      relations: ['fornecedor', 'responsavel'],
    });

    if (!pedido) {
      throw new NotFoundException('Pedido de compra não encontrado');
    }

    return pedido;
  }

  async atualizarPedidoCompra(id: number, updatePedidoDto: any): Promise<PedidoCompra> {
    const pedido = await this.obterPedidoCompra(id);
    
    Object.assign(pedido, updatePedidoDto);
    return await this.pedidoRepo.save(pedido);
  }

  async aprovarPedidoCompra(id: number): Promise<PedidoCompra> {
    const pedido = await this.obterPedidoCompra(id);
    
    if (pedido.status !== 'pendente') {
      throw new BadRequestException('Apenas pedidos pendentes podem ser aprovados');
    }

    pedido.status = 'aprovado';
    pedido.dataAprovacao = new Date();
    
    return await this.pedidoRepo.save(pedido);
  }

  async enviarPedidoCompra(id: number): Promise<PedidoCompra> {
    const pedido = await this.obterPedidoCompra(id);
    
    if (pedido.status !== 'aprovado') {
      throw new BadRequestException('Apenas pedidos aprovados podem ser enviados');
    }

    pedido.status = 'enviado';
    pedido.dataEnvio = new Date();
    
    return await this.pedidoRepo.save(pedido);
  }

  async receberPedidoCompra(id: number): Promise<PedidoCompra> {
    const pedido = await this.obterPedidoCompra(id);
    
    if (pedido.status !== 'enviado') {
      throw new BadRequestException('Apenas pedidos enviados podem ser recebidos');
    }

    pedido.status = 'recebido';
    pedido.dataRecebimento = new Date();
    
    return await this.pedidoRepo.save(pedido);
  }

  async removerPedidoCompra(id: number): Promise<void> {
    const pedido = await this.obterPedidoCompra(id);
    await this.pedidoRepo.remove(pedido);
  }

  
  async listarAvaliacoes(filtros?: any): Promise<AvaliacaoFornecedor[]> {
    const query = this.avaliacaoRepo
      .createQueryBuilder('avaliacao')
      .leftJoinAndSelect('avaliacao.fornecedor', 'fornecedor')
      .leftJoinAndSelect('avaliacao.avaliador', 'avaliador');

    if (filtros?.fornecedorId) {
      query.where('avaliacao.fornecedorId = :fornecedorId', { fornecedorId: filtros.fornecedorId });
    }

    if (filtros?.status) {
      query.andWhere('avaliacao.status = :status', { status: filtros.status });
    }

    return await query
      .orderBy('avaliacao.createdAt', 'DESC')
      .getMany();
  }

  async criarAvaliacao(createAvaliacaoDto: any): Promise<AvaliacaoFornecedor> {
    const fornecedor = await this.fornecedorRepo.findOne({ where: { id: createAvaliacaoDto.fornecedorId } });
    
    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    const notaMedia = (
      createAvaliacaoDto.qualidadeProdutos +
      createAvaliacaoDto.prazoEntrega +
      createAvaliacaoDto.atendimento +
      createAvaliacaoDto.precoCompetitivo
    ) / 4;

    const avaliacao = this.avaliacaoRepo.create({
      ...createAvaliacaoDto,
      notaMedia,
    });

    return await this.avaliacaoRepo.save(avaliacao) as unknown as AvaliacaoFornecedor;
  }

  async obterAvaliacao(id: number): Promise<AvaliacaoFornecedor> {
    const avaliacao = await this.avaliacaoRepo.findOne({
      where: { id },
      relations: ['fornecedor', 'avaliador'],
    });

    if (!avaliacao) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    return avaliacao;
  }

  async atualizarAvaliacao(id: number, updateAvaliacaoDto: any): Promise<AvaliacaoFornecedor> {
    const avaliacao = await this.obterAvaliacao(id);
    
    Object.assign(avaliacao, updateAvaliacaoDto);
    
    
    avaliacao.notaMedia = (
      avaliacao.qualidadeProdutos +
      avaliacao.prazoEntrega +
      avaliacao.atendimento +
      avaliacao.precoCompetitivo
    ) / 4;
    
    return await this.avaliacaoRepo.save(avaliacao);
  }

  async removerAvaliacao(id: number): Promise<void> {
    const avaliacao = await this.obterAvaliacao(id);
    await this.avaliacaoRepo.remove(avaliacao);
  }

  
  async listarContratos(filtros?: any): Promise<ContratoFornecedor[]> {
    const query = this.contratoRepo
      .createQueryBuilder('contrato')
      .leftJoinAndSelect('contrato.fornecedor', 'fornecedor')
      .leftJoinAndSelect('contrato.responsavel', 'responsavel');

    if (filtros?.fornecedorId) {
      query.where('contrato.fornecedorId = :fornecedorId', { fornecedorId: filtros.fornecedorId });
    }

    if (filtros?.status) {
      query.andWhere('contrato.status = :status', { status: filtros.status });
    }

    if (filtros?.vencendo) {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + 30); 
      query.andWhere('contrato.dataFim <= :dataLimite', { dataLimite });
    }

    return await query
      .orderBy('contrato.dataFim', 'ASC')
      .getMany();
  }

  async criarContrato(createContratoDto: any): Promise<ContratoFornecedor> {
    const fornecedor = await this.fornecedorRepo.findOne({ where: { id: createContratoDto.fornecedorId } });
    
    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    const contrato = this.contratoRepo.create({
      ...createContratoDto,
      numero: `CT-${Date.now()}`,
    });

    return await this.contratoRepo.save(contrato) as unknown as ContratoFornecedor;
  }

  async obterContrato(id: number): Promise<ContratoFornecedor> {
    const contrato = await this.contratoRepo.findOne({
      where: { id },
      relations: ['fornecedor', 'responsavel'],
    });

    if (!contrato) {
      throw new NotFoundException('Contrato não encontrado');
    }

    return contrato;
  }

  async atualizarContrato(id: number, updateContratoDto: any): Promise<ContratoFornecedor> {
    const contrato = await this.obterContrato(id);
    
    Object.assign(contrato, updateContratoDto);
    return await this.contratoRepo.save(contrato);
  }

  async renovarContrato(id: number, renovacaoDto: any): Promise<ContratoFornecedor> {
    const contrato = await this.obterContrato(id);
    
    if (contrato.status !== 'vigente') {
      throw new BadRequestException('Apenas contratos vigentes podem ser renovados');
    }

    contrato.status = 'renovado';
    contrato.dataFim = renovacaoDto.novaDataFim;
    
    return await this.contratoRepo.save(contrato);
  }

  async removerContrato(id: number): Promise<void> {
    const contrato = await this.obterContrato(id);
    await this.contratoRepo.remove(contrato);
  }

  
  async obterResumoCompras(filtros?: any): Promise<any> {
    const query = this.pedidoRepo.createQueryBuilder('pedido');

    if (filtros?.dataInicio && filtros?.dataFim) {
      query.andWhere('pedido.createdAt BETWEEN :dataInicio AND :dataFim', {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
    }

    const totalPedidos = await query.getCount();
    const totalValor = await query
      .select('SUM(pedido.valorTotal)', 'total')
      .getRawOne();

    const pedidosPorStatus = await query
      .select('pedido.status, COUNT(*) as quantidade')
      .groupBy('pedido.status')
      .getRawMany();

    return {
      totalPedidos,
      totalValor: parseFloat(totalValor?.total || '0'),
      pedidosPorStatus,
    };
  }

  async obterRelatorioFornecedores(filtros?: any): Promise<any[]> {
    const query = this.pedidoRepo
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.fornecedor', 'fornecedor')
      .select([
        'fornecedor.id',
        'fornecedor.nome',
        'fornecedor.email',
        'COUNT(pedido.id) as totalPedidos',
        'SUM(pedido.valorTotal) as totalValor',
        'AVG(pedido.valorTotal) as valorMedio'
      ])
      .groupBy('fornecedor.id');

    if (filtros?.dataInicio && filtros?.dataFim) {
      query.andWhere('pedido.createdAt BETWEEN :dataInicio AND :dataFim', {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
    }

    return await query.getRawMany();
  }

  async obterRelatorioProdutos(filtros?: any): Promise<any[]> {
    
    return [];
  }
}
