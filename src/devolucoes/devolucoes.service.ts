import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Devolucao, ItemDevolucao } from './devolucao.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { Produto } from '../produtos/produto.entity';
import { CreateDevolucaoDto, AprovarDevolucaoDto } from './dto/create-devolucao.dto';

@Injectable()
export class DevolucoesService {
  constructor(
    @InjectRepository(Devolucao)
    private devolucaoRepo: Repository<Devolucao>,
    @InjectRepository(Pedido)
    private pedidoRepo: Repository<Pedido>,
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
    private dataSource: DataSource,
  ) {}

  async solicitar(dto: CreateDevolucaoDto, empresaId: string): Promise<Devolucao> {
    const pedido = await this.pedidoRepo.findOne({ where: { id: dto.pedidoId, empresaId } });
    if (!pedido) throw new NotFoundException('Pedido não encontrado.');

    const devolucao = this.devolucaoRepo.create({
      empresaId,
      pedidoId: dto.pedidoId,
      motivo: dto.motivo,
      observacoes: dto.observacoes,
      status: 'pendente',
    });

    devolucao.itens = dto.itens.map(item => {
      const itemDev = new ItemDevolucao();
      itemDev.produtoId = item.produtoId;
      itemDev.quantidade = item.quantidade;
      itemDev.condicao = item.condicao || 'bom';
      return itemDev;
    });

    return this.devolucaoRepo.save(devolucao);
  }

  async listar(empresaId: string): Promise<Devolucao[]> {
    return this.devolucaoRepo.find({
      where: { empresaId },
      relations: ['pedido', 'pedido.cliente', 'itens', 'itens.produto'],
      order: { criadoEm: 'DESC' },
    });
  }

  async obter(id: number, empresaId: string): Promise<Devolucao> {
    const devolucao = await this.devolucaoRepo.findOne({
      where: { id, empresaId },
      relations: ['pedido', 'pedido.cliente', 'itens', 'itens.produto'],
    });
    if (!devolucao) throw new NotFoundException('Devolução não encontrada.');
    return devolucao;
  }

  async processar(id: number, dto: AprovarDevolucaoDto, empresaId: string): Promise<Devolucao> {
    const devolucao = await this.obter(id, empresaId);
    if (devolucao.status !== 'pendente') throw new BadRequestException('Devolução já processada.');

    return this.dataSource.transaction(async manager => {
        devolucao.status = dto.status;
        
        if (dto.status === 'aprovada') {
            devolucao.tipoReembolso = dto.tipoReembolso;
            devolucao.valorReembolso = dto.valorReembolso || 0;

            // Reentrada no estoque?
            if (dto.reentradaEstoque) {
                for (const item of devolucao.itens) {
                    const produto = await manager.findOne(Produto, { where: { id: item.produtoId } });
                    if (produto) {
                        produto.estoque += item.quantidade;
                        await manager.save(Produto, produto);
                    }
                }
            }
        }

        return manager.save(Devolucao, devolucao);
    });
  }
}
