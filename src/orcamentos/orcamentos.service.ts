import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orcamento } from './orcamento.entity';
import { ItemOrcamento } from './item-orcamento.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { CreateOrcamentoDto } from './dto/create-orcamento.dto';
import { UpdateOrcamentoDto } from './dto/update-orcamento.dto';

@Injectable()
export class OrcamentosService {
  constructor(
    @InjectRepository(Orcamento)
    private orcamentoRepo: Repository<Orcamento>,
    @InjectRepository(ItemOrcamento)
    private itemOrcamentoRepo: Repository<ItemOrcamento>,
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  async create(createOrcamentoDto: CreateOrcamentoDto) {
    const { clienteId, email, telefone, itens, desconto = 0, validade, observacoes } = createOrcamentoDto;

    // Verificar se o cliente existe
    const cliente = await this.clienteRepo.findOne({ where: { id: clienteId } });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const produtoIds = itens.map(item => item.produtoId);
    const produtos = await this.produtoRepo.findByIds(produtoIds);

    if (produtos.length !== produtoIds.length) {
      throw new BadRequestException('Um ou mais produtos não foram encontrados');
    }

    const orcamento = this.orcamentoRepo.create({
      cliente,
      clienteId,
      email,
      telefone,
      desconto,
      validade: validade ? new Date(validade) : undefined,
      observacoes,
      status: 'pendente',
    });

    let subtotal = 0;

    const itensOrcamento = itens.map(item => {
      const produto = produtos.find(p => p.id === item.produtoId);
      if (!produto) {
        throw new BadRequestException(`Produto com ID ${item.produtoId} não encontrado`);
      }

      const precoUnitario = Number(produto.preco);
      const subtotalItem = precoUnitario * item.quantidade;

      subtotal += subtotalItem;

      return this.itemOrcamentoRepo.create({
        produtoId: produto.id,
        produtoNome: produto.nome,
        precoUnitario,
        quantidade: item.quantidade,
        subtotal: subtotalItem,
        orcamento,
      });
    });

    const valorDesconto = subtotal * (desconto / 100);
    const total = subtotal - valorDesconto;

    orcamento.subtotal = subtotal;
    orcamento.total = total;
    orcamento.itens = itensOrcamento;

    return await this.orcamentoRepo.save(orcamento);
  }

  async findAll(status?: string) {
    const query = this.orcamentoRepo
      .createQueryBuilder('orcamento')
      .leftJoinAndSelect('orcamento.cliente', 'cliente')
      .leftJoinAndSelect('orcamento.itens', 'itens')
      .orderBy('orcamento.criadoEm', 'DESC');

    if (status) {
      query.where('orcamento.status = :status', { status });
    }

    return await query.getMany();
  }

  async findOne(id: number) {
    const orcamento = await this.orcamentoRepo.findOne({
      where: { id },
      relations: ['cliente', 'itens'],
    });

    if (!orcamento) {
      throw new NotFoundException(`Orçamento com ID ${id} não encontrado`);
    }

    return orcamento;
  }

  async update(id: number, updateOrcamentoDto: UpdateOrcamentoDto) {
    const orcamento = await this.findOne(id);

    if (updateOrcamentoDto.email !== undefined) orcamento.email = updateOrcamentoDto.email;
    if (updateOrcamentoDto.telefone !== undefined) orcamento.telefone = updateOrcamentoDto.telefone;
    if (updateOrcamentoDto.status) orcamento.status = updateOrcamentoDto.status;
    if (updateOrcamentoDto.observacoes !== undefined) orcamento.observacoes = updateOrcamentoDto.observacoes;
    if (updateOrcamentoDto.validade) orcamento.validade = new Date(updateOrcamentoDto.validade);

    if (updateOrcamentoDto.desconto !== undefined) {
      orcamento.desconto = updateOrcamentoDto.desconto;
      const valorDesconto = orcamento.subtotal * (updateOrcamentoDto.desconto / 100);
      orcamento.total = orcamento.subtotal - valorDesconto;
    }

    return await this.orcamentoRepo.save(orcamento);
  }

  async remove(id: number) {
    const orcamento = await this.findOne(id);
    await this.orcamentoRepo.remove(orcamento);
    return { message: 'Orçamento removido com sucesso' };
  }

  async converterEmPedido(id: number) {
    const orcamento = await this.findOne(id);

    if (orcamento.status === 'convertido') {
      throw new BadRequestException('Orçamento já foi convertido em pedido');
    }

    orcamento.status = 'convertido';
    await this.orcamentoRepo.save(orcamento);

    return {
      message: 'Orçamento convertido em pedido com sucesso',
      orcamento
    };
  }

  async getStats() {
    const [
      totalOrcamentos,
      orcamentosPendentes,
      orcamentosAprovados,
      valorTotal,
      taxaConversao
    ] = await Promise.all([
      this.orcamentoRepo.count(),
      this.orcamentoRepo.count({ where: { status: 'pendente' } }),
      this.orcamentoRepo.count({ where: { status: 'aprovado' } }),
      this.orcamentoRepo
        .createQueryBuilder('orcamento')
        .select('SUM(orcamento.total)', 'total')
        .getRawOne(),
      this.calcularTaxaConversao(),
    ]);

    return {
      totalOrcamentos,
      orcamentosPendentes,
      orcamentosAprovados,
      valorTotal: Number(valorTotal?.total || 0),
      taxaConversao,
    };
  }

  private async calcularTaxaConversao(): Promise<number> {
    const total = await this.orcamentoRepo.count();
    const convertidos = await this.orcamentoRepo.count({ where: { status: 'convertido' } });
    return total > 0 ? (convertidos / total) * 100 : 0;
  }
}