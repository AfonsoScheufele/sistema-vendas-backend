import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venda } from './venda.entity';
import { ItemVenda } from './item-venda.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { CreateVendaDto } from './dto/create-venda.dto';
import { OportunidadeVenda } from './oportunidade-venda.entity';
import { Comissao } from './comissao.entity';
import { MetaVenda } from './meta-venda.entity';
import { Usuario } from '../auth/usuario.entity';

@Injectable()
export class VendasService {
  constructor(
    @InjectRepository(Venda)
    private vendaRepo: Repository<Venda>,
    @InjectRepository(ItemVenda)
    private itemVendaRepo: Repository<ItemVenda>,
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
    @InjectRepository(OportunidadeVenda)
    private oportunidadeRepo: Repository<OportunidadeVenda>,
    @InjectRepository(Comissao)
    private comissaoRepo: Repository<Comissao>,
    @InjectRepository(MetaVenda)
    private metaRepo: Repository<MetaVenda>,
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreateVendaDto) {
    const cliente = await this.clienteRepo.findOneBy({ id: dto.clienteId });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    let total = 0;
    const itens: ItemVenda[] = [];

    for (const item of dto.itens) {
      const produto = await this.produtoRepo.findOneBy({ id: item.produtoId });
      if (!produto) {
        throw new NotFoundException(`Produto com ID ${item.produtoId} não encontrado`);
      }
      
      if (produto.estoque < item.quantidade) {
        throw new BadRequestException(`Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoque}`);
      }

      produto.estoque -= item.quantidade;
      await this.produtoRepo.save(produto);

      const itemVenda = this.itemVendaRepo.create({
        produto,
        quantidade: item.quantidade,
        preco_unitario: produto.preco,
      });
      itens.push(itemVenda);
      total += produto.preco * item.quantidade;
    }

    const venda = this.vendaRepo.create({
      cliente,
      itens,
      total,
    });

    return this.vendaRepo.save(venda);
  }

  findAll(filtros?: { status?: string; vendedorId?: string; clienteId?: string }) {
    const query = this.vendaRepo.createQueryBuilder('venda')
      .leftJoinAndSelect('venda.cliente', 'cliente')
      .leftJoinAndSelect('venda.itens', 'itens')
      .leftJoinAndSelect('itens.produto', 'produto')
      .leftJoinAndSelect('venda.vendedor', 'vendedor');
    
    if (filtros?.status) {
      query.andWhere('venda.status = :status', { status: filtros.status });
    }
    
    if (filtros?.vendedorId) {
      query.andWhere('venda.vendedorId = :vendedorId', { vendedorId: parseInt(filtros.vendedorId) });
    }
    
    if (filtros?.clienteId) {
      query.andWhere('venda.clienteId = :clienteId', { clienteId: parseInt(filtros.clienteId) });
    }
    
    return query.orderBy('venda.data', 'DESC').getMany();
  }

  async getStats(periodo?: string) {
    const query = this.vendaRepo.createQueryBuilder('venda');
    
    if (periodo === 'mes') {
      query.andWhere('venda.data >= :dataInicio', {
        dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      });
    }
    
    const totalVendas = await query.getCount();
    const totalFaturamento = await query
      .select('SUM(venda.total)', 'total')
      .getRawOne();
    
    return {
      totalVendas,
      totalFaturamento: parseFloat(totalFaturamento?.total || '0')
    };
  }

  async getVendedores() {
    return this.vendaRepo
      .createQueryBuilder('venda')
      .leftJoinAndSelect('venda.vendedor', 'vendedor')
      .select('DISTINCT vendedor.id, vendedor.name, vendedor.email')
      .where('vendedor.id IS NOT NULL')
      .getRawMany();
  }

  async getComissoes(vendedorId?: string, periodo?: string) {
    const query = this.vendaRepo
      .createQueryBuilder('venda')
      .leftJoinAndSelect('venda.itens', 'item')
      .leftJoinAndSelect('item.produto', 'produto')
      .leftJoinAndSelect('venda.cliente', 'cliente');
    
    if (vendedorId) {
      query.andWhere('venda.vendedorId = :vendedorId', { vendedorId: parseInt(vendedorId) });
    }
    
    if (periodo === 'mes') {
      query.andWhere('venda.data >= :dataInicio', {
        dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      });
    }
    
    const vendas = await query.getMany();
    
    // Transformar vendas em comissões individuais por item
    const comissoes = [];
    
    for (const venda of vendas) {
      for (const item of venda.itens) {
        comissoes.push({
          id: `${venda.id}-${item.id}`,
          vendaId: venda.id,
          produto: item.produto,
          cliente: venda.cliente,
          quantidade: item.quantidade,
          precoUnitario: item.preco_unitario,
          valorTotal: item.quantidade * item.preco_unitario,
          percentualComissao: 5, // 5% padrão
          valorComissao: (item.quantidade * item.preco_unitario) * 0.05,
          data: venda.data,
          status: 'pendente'
        });
      }
    }
    
    return comissoes;
  }

  async getRelatorio(dataInicio?: string, dataFim?: string) {
    const query = this.vendaRepo.createQueryBuilder('venda')
      .leftJoinAndSelect('venda.cliente', 'cliente')
      .leftJoinAndSelect('venda.vendedor', 'vendedor');
    
    if (dataInicio) {
      query.andWhere('venda.data >= :dataInicio', { dataInicio: new Date(dataInicio) });
    }
    
    if (dataFim) {
      query.andWhere('venda.data <= :dataFim', { dataFim: new Date(dataFim) });
    }
    
    return query.orderBy('venda.data', 'DESC').getMany();
  }

  async findOne(id: number) {
    const venda = await this.vendaRepo.findOne({
      where: { id },
      relations: ['cliente', 'itens', 'itens.produto'],
    });

    if (!venda) {
      throw new NotFoundException('Venda não encontrada');
    }

    return venda;
  }

  async delete(id: number) {
    const venda = await this.vendaRepo.findOne({ 
      where: { id }, 
      relations: ['itens', 'itens.produto'] 
    });
    
    if (!venda) {
      throw new NotFoundException('Venda não encontrada');
    }

    // Restaurar estoque dos produtos
    for (const item of venda.itens) {
      const produto = await this.produtoRepo.findOneBy({ id: item.produto.id });
      if (produto) {
        produto.estoque += item.quantidade;
        await this.produtoRepo.save(produto);
      }
    }

    await this.vendaRepo.delete(id);
  }

  // Pipeline de Vendas
  async obterPipeline(filtros?: any): Promise<OportunidadeVenda[]> {
    const query = this.oportunidadeRepo
      .createQueryBuilder('oportunidade')
      .leftJoinAndSelect('oportunidade.cliente', 'cliente')
      .leftJoinAndSelect('oportunidade.responsavel', 'responsavel');

    if (filtros?.etapa) {
      query.where('oportunidade.etapa = :etapa', { etapa: filtros.etapa });
    }

    if (filtros?.responsavelId) {
      query.andWhere('oportunidade.responsavelId = :responsavelId', { responsavelId: filtros.responsavelId });
    }

    if (filtros?.status) {
      query.andWhere('oportunidade.status = :status', { status: filtros.status });
    }

    return await query
      .orderBy('oportunidade.createdAt', 'DESC')
      .getMany();
  }

  async criarOportunidade(createOportunidadeDto: any): Promise<OportunidadeVenda> {
    const oportunidade = this.oportunidadeRepo.create(createOportunidadeDto);
    return await this.oportunidadeRepo.save(oportunidade) as unknown as OportunidadeVenda;
  }

  async obterOportunidade(id: number): Promise<OportunidadeVenda> {
    const oportunidade = await this.oportunidadeRepo.findOne({
      where: { id },
      relations: ['cliente', 'responsavel'],
    });

    if (!oportunidade) {
      throw new NotFoundException('Oportunidade não encontrada');
    }

    return oportunidade;
  }

  async atualizarOportunidade(id: number, updateOportunidadeDto: any): Promise<OportunidadeVenda> {
    const oportunidade = await this.obterOportunidade(id);
    
    Object.assign(oportunidade, updateOportunidadeDto);
    return await this.oportunidadeRepo.save(oportunidade);
  }

  async atualizarEtapa(id: number, updateEtapaDto: any): Promise<OportunidadeVenda> {
    const oportunidade = await this.obterOportunidade(id);
    oportunidade.etapa = updateEtapaDto.etapa;
    
    if (updateEtapaDto.etapa === 'fechamento') {
      oportunidade.status = 'ganha';
    }
    
    return await this.oportunidadeRepo.save(oportunidade);
  }

  async removerOportunidade(id: number): Promise<void> {
    const oportunidade = await this.obterOportunidade(id);
    await this.oportunidadeRepo.remove(oportunidade);
  }

  // Comissões
  async obterComissoes(filtros?: any): Promise<Comissao[]> {
    const query = this.comissaoRepo
      .createQueryBuilder('comissao')
      .leftJoinAndSelect('comissao.vendedor', 'vendedor')
      .leftJoinAndSelect('comissao.venda', 'venda');

    if (filtros?.vendedorId) {
      query.where('comissao.vendedorId = :vendedorId', { vendedorId: filtros.vendedorId });
    }

    if (filtros?.status) {
      query.andWhere('comissao.status = :status', { status: filtros.status });
    }

    return await query
      .orderBy('comissao.createdAt', 'DESC')
      .getMany();
  }

  async obterComissao(id: number): Promise<Comissao> {
    const comissao = await this.comissaoRepo.findOne({
      where: { id },
      relations: ['vendedor', 'venda'],
    });

    if (!comissao) {
      throw new NotFoundException('Comissão não encontrada');
    }

    return comissao;
  }

  async pagarComissao(id: number): Promise<Comissao> {
    const comissao = await this.obterComissao(id);
    comissao.status = 'paga';
    comissao.dataPagamento = new Date();
    
    return await this.comissaoRepo.save(comissao);
  }

  // Metas
  async obterMetas(filtros?: any): Promise<MetaVenda[]> {
    const query = this.metaRepo
      .createQueryBuilder('meta')
      .leftJoinAndSelect('meta.vendedor', 'vendedor');

    if (filtros?.vendedorId) {
      query.where('meta.vendedorId = :vendedorId', { vendedorId: filtros.vendedorId });
    }

    if (filtros?.status) {
      query.andWhere('meta.status = :status', { status: filtros.status });
    }

    if (filtros?.periodo) {
      query.andWhere('meta.periodo = :periodo', { periodo: filtros.periodo });
    }

    return await query
      .orderBy('meta.dataInicio', 'DESC')
      .getMany();
  }

  async criarMeta(createMetaDto: any): Promise<MetaVenda> {
    const meta = this.metaRepo.create(createMetaDto);
    return await this.metaRepo.save(meta) as unknown as MetaVenda;
  }

  async obterMeta(id: number): Promise<MetaVenda> {
    const meta = await this.metaRepo.findOne({
      where: { id },
      relations: ['vendedor'],
    });

    if (!meta) {
      throw new NotFoundException('Meta não encontrada');
    }

    return meta;
  }

  async atualizarMeta(id: number, updateMetaDto: any): Promise<MetaVenda> {
    const meta = await this.obterMeta(id);
    
    Object.assign(meta, updateMetaDto);
    return await this.metaRepo.save(meta);
  }

  async removerMeta(id: number): Promise<void> {
    const meta = await this.obterMeta(id);
    await this.metaRepo.remove(meta);
  }

  // Relatórios de Vendas
  async obterResumoVendas(filtros?: any): Promise<any> {
    const query = this.vendaRepo.createQueryBuilder('venda');

    if (filtros?.dataInicio && filtros?.dataFim) {
      query.andWhere('venda.data BETWEEN :dataInicio AND :dataFim', {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
    }

    const totalVendas = await query.getCount();
    const totalFaturamento = await query
      .select('SUM(venda.total)', 'total')
      .getRawOne();

    const vendasPorStatus = await query
      .select('venda.status, COUNT(*) as quantidade')
      .groupBy('venda.status')
      .getRawMany();

    return {
      totalVendas,
      totalFaturamento: parseFloat(totalFaturamento?.total || '0'),
      vendasPorStatus,
    };
  }

  async obterRelatorioVendedores(filtros?: any): Promise<any[]> {
    const query = this.vendaRepo
      .createQueryBuilder('venda')
      .leftJoinAndSelect('venda.vendedor', 'vendedor')
      .select([
        'vendedor.id',
        'vendedor.name',
        'vendedor.email',
        'COUNT(venda.id) as totalVendas',
        'SUM(venda.total) as totalFaturamento',
        'AVG(venda.total) as ticketMedio'
      ])
      .groupBy('vendedor.id');

    if (filtros?.dataInicio && filtros?.dataFim) {
      query.andWhere('venda.data BETWEEN :dataInicio AND :dataFim', {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
    }

    return await query.getRawMany();
  }

  async obterRelatorioProdutos(filtros?: any): Promise<any[]> {
    const query = this.itemVendaRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.produto', 'produto')
      .leftJoinAndSelect('item.venda', 'venda')
      .select([
        'produto.id',
        'produto.nome',
        'produto.categoria',
        'SUM(item.quantidade) as quantidadeVendida',
        'SUM(item.quantidade * item.preco_unitario) as faturamento'
      ])
      .groupBy('produto.id');

    if (filtros?.dataInicio && filtros?.dataFim) {
      query.andWhere('venda.data BETWEEN :dataInicio AND :dataFim', {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
    }

    return await query.getRawMany();
  }
}
