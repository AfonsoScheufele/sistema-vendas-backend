import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './pedido.entity';
import { ItemPedido } from './item-pedido.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepo: Repository<Pedido>,
    @InjectRepository(ItemPedido)
    private itemPedidoRepo: Repository<ItemPedido>,
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const { clienteId, itens } = createPedidoDto;

    const produtoIds = itens.map(item => item.produtoId);
    const produtos = await this.produtoRepo.findByIds(produtoIds);

    if (produtos.length !== produtoIds.length) {
      throw new BadRequestException('Um ou mais produtos não foram encontrados');
    }

    const cliente = await this.clienteRepo.findOneBy({ id: clienteId });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const pedido = this.pedidoRepo.create({
      cliente,
      clienteId,
      status: 'pendente',
    });

    let total = 0;
    let totalComissao = 0;

    const itensPedido = itens.map(item => {
      const produto = produtos.find(p => p.id === item.produtoId);
      if (!produto) {
        throw new BadRequestException(`Produto com ID ${item.produtoId} não encontrado`);
      }

      if (produto.estoque < item.quantidade) {
        throw new BadRequestException(`Estoque insuficiente para o produto ${produto.nome}. Disponível: ${produto.estoque}`);
      }

      const precoUnitario = Number(produto.preco);
      const subtotal = precoUnitario * item.quantidade;
      const valorComissao = subtotal * (item.comissao / 100);
      const totalItem = subtotal + valorComissao;

      total += totalItem;
      totalComissao += valorComissao;

      return this.itemPedidoRepo.create({
        produtoId: produto.id,
        produtoNome: produto.nome,
        precoUnitario,
        quantidade: item.quantidade,
        comissao: item.comissao,
        subtotal,
        valorComissao,
        pedido,
      });
    });

    pedido.total = total;
    pedido.totalComissao = totalComissao;
    pedido.itens = itensPedido;

    const pedidoSalvo = await this.pedidoRepo.save(pedido);

    for (const item of itens) {
      const produto = produtos.find(p => p.id === item.produtoId);
      if (produto) {
        produto.estoque -= item.quantidade;
        await this.produtoRepo.save(produto);
      }
    }

    return pedidoSalvo;
  }

  async findAll() {
    return await this.pedidoRepo.find({
      relations: ['itens'],
      order: { criadoEm: 'DESC' },
    });
  }

  async findOne(id: number) {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
      relations: ['itens'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    return pedido;
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const pedido = await this.findOne(id);

    if (updatePedidoDto.status) {
      pedido.status = updatePedidoDto.status;
    }

    if (updatePedidoDto.clienteId) {
      const cliente = await this.clienteRepo.findOneBy({ id: updatePedidoDto.clienteId });
      if (cliente) {
        pedido.cliente = cliente;
        pedido.clienteId = updatePedidoDto.clienteId;
      }
    }

    if (updatePedidoDto.itens) {
      await this.itemPedidoRepo.delete({ pedidoId: id });

      const produtoIds = updatePedidoDto.itens.map(item => item.produtoId);
      const produtos = await this.produtoRepo.findByIds(produtoIds);

      if (produtos.length !== produtoIds.length) {
        throw new BadRequestException('Um ou mais produtos não foram encontrados');
      }

      let total = 0;
      let totalComissao = 0;

      const novosItens = updatePedidoDto.itens.map(item => {
        const produto = produtos.find(p => p.id === item.produtoId);
        if (!produto) {
          throw new BadRequestException(`Produto com ID ${item.produtoId} não encontrado`);
        }

        const precoUnitario = Number(produto.preco);
        const subtotal = precoUnitario * item.quantidade;
        const valorComissao = subtotal * (item.comissao / 100);
        const totalItem = subtotal + valorComissao;

        total += totalItem;
        totalComissao += valorComissao;

        return this.itemPedidoRepo.create({
          pedidoId: id,
          produtoId: produto.id,
          produtoNome: produto.nome,
          precoUnitario,
          quantidade: item.quantidade,
          comissao: item.comissao,
          subtotal,
          valorComissao,
        });
      });

      await this.itemPedidoRepo.save(novosItens);

      pedido.total = total;
      pedido.totalComissao = totalComissao;
    }

    return await this.pedidoRepo.save(pedido);
  }

  async remove(id: number) {
    const pedido = await this.findOne(id);

    if (pedido.status === 'pendente') {
      for (const item of pedido.itens) {
        const produto = await this.produtoRepo.findOne({ where: { id: item.produtoId } });
        if (produto) {
          produto.estoque += item.quantidade;
          await this.produtoRepo.save(produto);
        }
      }
    }

    await this.pedidoRepo.remove(pedido);
    return { message: 'Pedido removido com sucesso' };
  }

  async getStats() {
    const [
      totalPedidos,
      pedidosPendentes,
      totalVendas,
      totalComissoes
    ] = await Promise.all([
      this.pedidoRepo.count(),
      this.pedidoRepo.count({ where: { status: 'pendente' } }),
      this.pedidoRepo
        .createQueryBuilder('pedido')
        .select('SUM(pedido.total)', 'total')
        .getRawOne(),
      this.pedidoRepo
        .createQueryBuilder('pedido')
        .select('SUM(pedido.totalComissao)', 'totalComissao')
        .getRawOne()
    ]);

    return {
      totalPedidos,
      pedidosPendentes,
      totalVendas: Number(totalVendas?.total || 0),
      totalComissoes: Number(totalComissoes?.totalComissao || 0),
    };
  }
}