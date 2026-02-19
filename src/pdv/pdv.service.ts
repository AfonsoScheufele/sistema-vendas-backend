import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Pedido } from '../pedidos/pedido.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { CreatePdvSaleDto } from './dto/create-pdv-sale.dto';

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
  ) {}

  async realizarVenda(dto: CreatePdvSaleDto, empresaId: string, usuarioId: number) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. Identificar Cliente (ou usar Consumidor Final se ID não fornecido)
      let clienteId = dto.clienteId;
      if (!clienteId) {
        // Tentar buscar um cliente padrão "Consumidor Final"
        const consumidorFinal = await manager.findOne(Cliente, {
          where: { empresaId, nome: 'Consumidor Final' }
        });
        if (consumidorFinal) {
          clienteId = consumidorFinal.id;
        } else {
             // Fallback: pegar o primeiro cliente da empresa (perigoso, mas para dev serve)
             const primeiro = await manager.findOne(Cliente, { where: { empresaId } });
             if (primeiro) clienteId = primeiro.id;
             else throw new BadRequestException('Nenhum cliente identificado e Consumidor Final não encontrado.');
        }
      }

      // 2. Calcular Totais e Validar Estoque
      let totalItens = 0;
      const itensParaSalvar: ItemPedido[] = [];

      for (const itemDto of dto.itens) {
        const produto = await manager.findOne(Produto, { 
            where: { id: itemDto.produtoId, empresaId },
            lock: { mode: 'pessimistic_write' }
        });

        if (!produto) throw new NotFoundException(`Produto ${itemDto.produtoId} não encontrado.`);
        
        if (produto.estoque < itemDto.quantidade) {
            throw new BadRequestException(`Estoque insuficiente para ${produto.nome}.`);
        }

        // Baixar Estoque
        produto.estoque -= itemDto.quantidade;
        await manager.save(produto);

        const subtotal = Number(itemDto.quantidade) * Number(itemDto.precoUnitario);
        totalItens += subtotal;

        const novoItem = new ItemPedido();
        novoItem.produto = produto;
        novoItem.produtoId = produto.id;
        novoItem.quantidade = itemDto.quantidade;
        novoItem.precoUnitario = itemDto.precoUnitario;
        novoItem.subtotal = subtotal;

        
        itensParaSalvar.push(novoItem);
      }

      const totalFinal = totalItens - (dto.desconto || 0);

      // 3. Criar Pedido
      // Gerar número
      const count = await manager.count(Pedido, { where: { empresaId } });
      const numero = `PDV-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;

      const pedido = new Pedido();
      pedido.empresaId = empresaId;
      pedido.numero = numero;
      pedido.clienteId = clienteId!;
      pedido.total = totalFinal;
      pedido.desconto = dto.desconto || 0;
      pedido.status = 'aprovado'; // Venda PDV já nasce aprovada
      pedido.dataPedido = new Date();
      pedido.origem = 'PDV';
      pedido.vendedorId = usuarioId;
      
      // Dados Pagamento
      if (dto.pagamento) {
          pedido.formaPagamento = dto.pagamento.forma;
          pedido.statusPagamento = 'pago';
          pedido.condicaoPagamento = 'A VISTA';
      } else {
        pedido.statusPagamento = 'pendente';
      }

      const pedidoSalvo = await manager.save(Pedido, pedido);

      // 4. Salvar Itens
      for (const item of itensParaSalvar) {
          item.pedido = pedidoSalvo;
          await manager.save(ItemPedido, item);
      }

      return pedidoSalvo;
    });
  }
}
