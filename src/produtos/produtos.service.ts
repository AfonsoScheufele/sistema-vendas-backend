import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
  ) {}

  create(dto: CreateProdutoDto) {
    const produto = this.produtoRepo.create(dto);
    return this.produtoRepo.save(produto);
  }

  findAll(filtros?: { categoria?: string; ativo?: string; search?: string }) {
    const query = this.produtoRepo.createQueryBuilder('produto');
    
    if (filtros?.categoria) {
      query.andWhere('produto.categoria = :categoria', { categoria: filtros.categoria });
    }
    
    if (filtros?.ativo !== undefined) {
      const ativo = filtros.ativo === 'true';
      query.andWhere('produto.ativo = :ativo', { ativo });
    }
    
    if (filtros?.search) {
      query.andWhere('(produto.nome ILIKE :search OR produto.descricao ILIKE :search)', { 
        search: `%${filtros.search}%` 
      });
    }
    
    return query.orderBy('produto.nome', 'ASC').getMany();
  }

  async getCategorias() {
    const result = await this.produtoRepo
      .createQueryBuilder('produto')
      .select('DISTINCT produto.categoria', 'categoria')
      .where('produto.categoria IS NOT NULL')
      .getRawMany();
    
    return result.map(item => item.categoria);
  }

  async getEstoqueBaixo() {
    return this.produtoRepo
      .createQueryBuilder('produto')
      .where('produto.estoque <= produto.estoqueMinimo')
      .andWhere('produto.ativo = :ativo', { ativo: true })
      .orderBy('produto.estoque', 'ASC')
      .getMany();
  }

  async getStats() {
    const total = await this.produtoRepo.count();
    const ativos = await this.produtoRepo.count({ where: { ativo: true } });
    const estoqueBaixo = await this.produtoRepo
      .createQueryBuilder('produto')
      .where('produto.estoque <= produto.estoqueMinimo')
      .getCount();
    
    return {
      total,
      ativos,
      inativos: total - ativos,
      estoqueBaixo
    };
  }

  async updateEstoque(id: number, quantidade: number, tipo: 'entrada' | 'saida') {
    const produto = await this.findOne(id);
    
    if (tipo === 'entrada') {
      produto.estoque += quantidade;
    } else {
      if (produto.estoque < quantidade) {
        throw new Error('Estoque insuficiente');
      }
      produto.estoque -= quantidade;
    }
    
    return this.produtoRepo.save(produto);
  }

  async findOne(id: number) {
    const produto = await this.produtoRepo.findOneBy({ id });
    
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return produto;
  }

  async update(id: number, dto: UpdateProdutoDto) {
    const produto = await this.findOne(id);
    
    Object.assign(produto, dto);
    return this.produtoRepo.save(produto);
  }

  async delete(id: number) {
    const produto = await this.findOne(id);
    await this.produtoRepo.delete(id);
  }
}
