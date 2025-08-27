import { Injectable } from '@nestjs/common';
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
    if (!cliente) throw new Error('Cliente não encontrado');

    let total = 0;
    const itens: ItemVenda[] = [];

    for (const item of dto.itens) {
      const produto = await this.produtoRepo.findOneBy({ id: item.produtoId });
      if (!produto) throw new Error(`Produto ${item.produtoId} não encontrado`);
      if (produto.estoque < item.quantidade) throw new Error(`Estoque insuficiente para ${produto.nome}`);

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

  findAll() {
    return this.vendaRepo.find({ relations: ['cliente', 'itens', 'itens.produto'] });
  }

  findOne(id: number) {
    return this.vendaRepo.findOne({
      where: { id },
      relations: ['cliente', 'itens', 'itens.produto'],
    });
  }

  async delete(id: number) {
    const venda = await this.vendaRepo.findOne({ where: { id }, relations: ['itens', 'itens.produto'] });
    if (!venda) return null;

    // Restituir estoque
    for (const item of venda.itens) {
        const produto = await this.produtoRepo.findOneBy({ id: item.produto.id });
        if (!produto) continue; // ignora se não existir
        produto.estoque += item.quantidade;
        await this.produtoRepo.save(produto);
    }

    return this.vendaRepo.delete(id);
    }
}
