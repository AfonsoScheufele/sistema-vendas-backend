import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Pedido } from '../pedidos/pedido.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { ComissaoEntity } from '../comissoes/comissao.entity';
import { CreatePdvSaleDto } from './dto/create-pdv-sale.dto';
import { PedidosService } from '../pedidos/pedidos.service';
import { MetasService } from '../metas/metas.service';

@Injectable()
export class PdvService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepo: Repository<Pedido>,
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
    private dataSource: DataSource,
    private pedidosService: PedidosService,
    private metasService: MetasService,
  ) {}

  async realizarVenda(dto: CreatePdvSaleDto, empresaId: string, usuarioId: number) {
    const pedidoSalvo = await this.dataSource.transaction(async (manager: EntityManager) => {
      let clienteId = dto.clienteId;
      if (!clienteId) {
        const consumidorFinal = await manager.findOne(Cliente, {
          where: { empresaId, nome: 'Consumidor Final' }
        });
        if (consumidorFinal) {
          clienteId = consumidorFinal.id;
        } else {
             const primeiro = await manager.findOne(Cliente, { where: { empresaId } });
             if (primeiro) clienteId = primeiro.id;
             else throw new BadRequestException('Nenhum cliente identificado e Consumidor Final não encontrado.');
        }
      }

      let totalItens = 0;
      const itensParaSalvar: ItemPedido[] = [];

      for (const itemDto of dto.itens) {
        const produto = await manager.findOne(Produto, { 
            where: { id: itemDto.produtoId, empresaId },
            lock: { mode: 'pessimistic_write' }
        });

        if (!produto) throw new NotFoundException(`Produto ${itemDto.produtoId} não encontrado.`);
        const estoqueDisponivel = Number(produto.estoque ?? 0);
        const qtd = Number(itemDto.quantidade ?? 0);
        if (estoqueDisponivel < qtd) {
          throw new BadRequestException(
            `Estoque insuficiente para "${produto.nome}". Disponível: ${estoqueDisponivel}, solicitado: ${qtd}.`
          );
        }
        produto.estoque = Math.max(0, estoqueDisponivel - qtd);
        await manager.save(produto);

        const subtotal = Number(itemDto.quantidade) * Number(itemDto.precoUnitario);
        totalItens += subtotal;

        let percentualComissao = 0;
        const comissao = await manager.getRepository(ComissaoEntity).findOne({
          where: { produtoId: itemDto.produtoId, empresaId, ativo: true },
          relations: ['vendedores'],
        });
        if (comissao) {
          const vendedorRegra = (comissao.vendedores as any[])?.find((v) => v.vendedorId === usuarioId);
          if (vendedorRegra && (vendedorRegra.tipo === 'percentual' || vendedorRegra.tipo === 'misto') && vendedorRegra.percentual != null) {
            percentualComissao = Number(vendedorRegra.percentual);
          } else if (comissao.tipoComissaoBase === 'percentual') {
            percentualComissao = Number(comissao.comissaoBase);
          }
        }

        const novoItem = new ItemPedido();
        novoItem.produto = produto;
        novoItem.produtoId = produto.id;
        novoItem.quantidade = itemDto.quantidade;
        novoItem.precoUnitario = itemDto.precoUnitario;
        novoItem.subtotal = subtotal;
        novoItem.comissao = percentualComissao;

        itensParaSalvar.push(novoItem);
      }

      const totalFinal = totalItens - (dto.desconto || 0);

      const count = await manager.count(Pedido, { where: { empresaId } });
      const numero = `PDV-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;

      const pedido = new Pedido();
      pedido.empresaId = empresaId;
      pedido.numero = numero;
      pedido.clienteId = clienteId!;
      pedido.total = totalFinal;
      pedido.desconto = dto.desconto || 0;
      pedido.status = 'aprovado';
      pedido.dataPedido = new Date();
      pedido.origem = 'PDV';
      pedido.vendedorId = usuarioId;
      
      if (dto.pagamento) {
          pedido.formaPagamento = dto.pagamento.forma;
          pedido.statusPagamento = 'pago';
          pedido.condicaoPagamento = 'A VISTA';
      } else {
        pedido.statusPagamento = 'pendente';
      }

      const pedidoSalvo = await manager.save(Pedido, pedido);

      for (const item of itensParaSalvar) {
          item.pedido = pedidoSalvo;
          await manager.save(ItemPedido, item);
      }

      return pedidoSalvo;
    });

    this.pedidosService.gerarNotaFiscalParaPedido(pedidoSalvo.id, empresaId).catch((err) => {
      console.error('[PdvService] Erro ao gerar NF automática para PDV:', err?.message || err);
    });

    this.metasService
      .atualizarMetasPorPedidoConfirmado(empresaId, pedidoSalvo.vendedorId ?? null, pedidoSalvo.dataPedido)
      .catch(() => {});

    return pedidoSalvo;
  }
}
