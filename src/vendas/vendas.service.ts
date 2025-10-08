import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venda } from './venda.entity';
import { ItemVenda } from './item-venda.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { CreateVendaDto } from './dto/create-venda.dto';

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
    const query = this.vendaRepo.createQueryBuilder('venda');
    
    if (vendedorId) {
      query.andWhere('venda.vendedorId = :vendedorId', { vendedorId: parseInt(vendedorId) });
    }
    
    if (periodo === 'mes') {
      query.andWhere('venda.data >= :dataInicio', {
        dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      });
    }
    
    const resultado = await query
      .select('SUM(venda.comissao)', 'totalComissao')
      .getRawOne();
    
    return {
      totalComissao: parseFloat(resultado?.totalComissao || '0')
    };
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
}
