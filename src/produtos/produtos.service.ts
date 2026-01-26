import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { ComissaoEntity } from '../comissoes/comissao.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { CategoriaDetectorService } from './categoria-detector.service';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
    @InjectRepository(ComissaoEntity)
    private comissaoRepo: Repository<ComissaoEntity>,
    @InjectRepository(ItemPedido)
    private itemPedidoRepo: Repository<ItemPedido>,
    private categoriaDetector: CategoriaDetectorService,
  ) {}

  async create(dto: CreateProdutoDto, empresaId: string) {
    let categoria = dto.categoria;
    if (!categoria || !categoria.trim()) {
      const categoriaDetectada = this.categoriaDetector.detectarCategoria(dto.nome);
      if (categoriaDetectada) {
        categoria = categoriaDetectada;
      }
    }

    const produto = this.produtoRepo.create({
      ...dto,
      categoria,
      empresaId,
      estoque: dto.estoque ?? 0,
      estoqueMinimo: dto.estoqueMinimo ?? 0,
    });
    const produtoSalvo = await this.produtoRepo.save(produto);

    const comissoesParaCriar = [];
    for (let percentual = 15; percentual >= 4; percentual--) {
      const comissao = this.comissaoRepo.create({
        empresaId,
        produtoId: produtoSalvo.id,
        tipoComissaoBase: 'percentual',
        comissaoBase: percentual,
        comissaoMinima: 0,
        comissaoMaxima: null,
        ativo: true,
      });
      comissoesParaCriar.push(comissao);
    }
    if (comissoesParaCriar.length > 0) {
      await this.comissaoRepo.save(comissoesParaCriar);
    }

    return produtoSalvo;
  }

  findAll(empresaId: string, filtros?: { categoria?: string; ativo?: string; search?: string }) {
    const query = this.produtoRepo.createQueryBuilder('produto');

    query.where('produto.empresaId = :empresaId', { empresaId });

    if (filtros?.categoria) {
      query.andWhere('produto.categoria = :categoria', { categoria: filtros.categoria });
    }

    if (filtros?.ativo && filtros.ativo !== 'todos') {
      const ativo = filtros.ativo === 'true';
      query.andWhere('produto.ativo = :ativo', { ativo });
    }

    if (filtros?.search) {
      query.andWhere(`(
        produto.nome ILIKE :search OR
        produto.descricao ILIKE :search OR
        produto.sku ILIKE :search OR
        produto.codigoBarras ILIKE :search
      )`, {
        search: `%${filtros.search}%` 
      });
    }

    return query.orderBy('produto.nome', 'ASC').getMany();
  }

  async getCategorias(empresaId: string) {
    const result = await this.produtoRepo
      .createQueryBuilder('produto')
      .where('produto.empresaId = :empresaId', { empresaId })
      .andWhere('produto.categoria IS NOT NULL')
      .select('DISTINCT produto.categoria', 'categoria')
      .getRawMany();

    return result.map(item => item.categoria);
  }

  async getEstoqueBaixo(empresaId: string) {
    return this.produtoRepo
      .createQueryBuilder('produto')
      .where('produto.empresaId = :empresaId', { empresaId })
      .andWhere('produto.estoque <= produto.estoqueMinimo')
      .andWhere('produto.ativo = :ativo', { ativo: true })
      .orderBy('produto.estoque', 'ASC')
      .getMany();
  }

  async getStats(empresaId: string) {
    const total = await this.produtoRepo.count({ where: { empresaId } });
    const ativos = await this.produtoRepo.count({ where: { empresaId, ativo: true } });
    const estoqueBaixo = await this.produtoRepo
      .createQueryBuilder('produto')
      .where('produto.empresaId = :empresaId', { empresaId })
      .andWhere('produto.estoque <= produto.estoqueMinimo')
      .getCount();

    return {
      total,
      ativos,
      inativos: total - ativos,
      estoqueBaixo
    };
  }

  async updateEstoque(id: number, empresaId: string, quantidade: number, tipo: 'entrada' | 'saida') {
    if (!quantidade || quantidade <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero');
    }
    const produto = await this.findOne(id, empresaId);

    if (tipo === 'entrada') {
      produto.estoque += quantidade;
    } else {
      if (produto.estoque < quantidade) {
        throw new BadRequestException('Estoque insuficiente');
      }
      produto.estoque -= quantidade;
    }

    return this.produtoRepo.save(produto);
  }

  async findOne(id: number, empresaId: string) {
    const produto = await this.produtoRepo.findOne({ where: { id, empresaId } });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return produto;
  }

  async update(id: number, empresaId: string, dto: UpdateProdutoDto) {
    if (dto.nome && (!dto.categoria || !dto.categoria.trim())) {
      const categoriaDetectada = this.categoriaDetector.detectarCategoria(dto.nome);
      if (categoriaDetectada) {
        dto.categoria = categoriaDetectada;
      }
    }
    const produto = await this.findOne(id, empresaId);

    Object.assign(produto, dto);
    return this.produtoRepo.save(produto);
  }

  async delete(id: number, empresaId: string) {
    const produto = await this.findOne(id, empresaId);
    
    const itensPedido = await this.itemPedidoRepo.find({
      where: { produtoId: id },
    });
    
    if (itensPedido.length > 0) {
      throw new BadRequestException(
        `Não é possível excluir o produto "${produto.nome}" pois ele está sendo utilizado em ${itensPedido.length} pedido(s).`
      );
    }
    
    const comissoes = await this.comissaoRepo.find({
      where: { produtoId: id, empresaId },
    });
    
    if (comissoes.length > 0) {
      await this.comissaoRepo.remove(comissoes);
    }
    
    await this.produtoRepo.remove(produto);
  }
}
