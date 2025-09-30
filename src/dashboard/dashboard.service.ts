import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Pedido } from '../pedidos/pedido.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';

interface DashboardStats {
  totalVendas: number;
  clientesAtivos: number;
  produtosEstoque: number;
  pedidosPendentes: number;
  faturamentoMes: number;
  crescimentoVendas: number;
  ticketMedio: number;
  conversao: number;
}

interface VendasMensais {
  mes: string;
  vendas: number;
  pedidos: number;
}

interface ClientesNovos {
  periodo: string;
  quantidade: number;
}

interface ProdutoMaisVendido {
  id: number;
  nome: string;
  quantidadeVendida: number;
  faturamento: number;
}

interface FaturamentoDiario {
  dia: string;
  faturamento: number;
  pedidos: number;
}

interface DistribuicaoCategoria {
  categoria: string;
  quantidade: number;
  percentual: number;
  faturamento: number;
}

@Injectable()
export class DashboardService {
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

  async getStats(periodo = '30d'): Promise<DashboardStats> {
    const agora = new Date();
    const diasAtras = this.getDiasAtras(periodo);
    const dataInicio = new Date(agora.getTime() - diasAtras * 24 * 60 * 60 * 1000);
    
    const dataInicioAnterior = new Date(dataInicio.getTime() - diasAtras * 24 * 60 * 60 * 1000);

    const [
      totalVendas,
      totalVendasAnterior,
      clientesAtivos,
      produtosEstoque,
      pedidosPendentes,
      faturamentoMes,
      ticketMedio
    ] = await Promise.all([
      this.pedidoRepo
        .createQueryBuilder('pedido')
        .select('SUM(pedido.total)', 'total')
        .where('pedido.criadoEm >= :dataInicio', { dataInicio })
        .getRawOne(),

      this.pedidoRepo
        .createQueryBuilder('pedido')
        .select('SUM(pedido.total)', 'total')
        .where('pedido.criadoEm >= :dataInicioAnterior AND pedido.criadoEm < :dataInicio', { 
          dataInicioAnterior, 
          dataInicio 
        })
        .getRawOne(),

      this.pedidoRepo
        .createQueryBuilder('pedido')
        .select('COUNT(DISTINCT pedido.cliente)', 'count')
        .where('pedido.criadoEm >= :dataInicio', { dataInicio })
        .getRawOne(),

      this.produtoRepo
        .createQueryBuilder('produto')
        .select('SUM(produto.estoque)', 'total')
        .getRawOne(),

      this.pedidoRepo.count({ where: { status: 'pendente' } }),

      this.pedidoRepo
        .createQueryBuilder('pedido')
        .select('SUM(pedido.total)', 'total')
        .where('EXTRACT(MONTH FROM pedido.criadoEm) = :mes AND EXTRACT(YEAR FROM pedido.criadoEm) = :ano', { 
          mes: agora.getMonth() + 1, 
          ano: agora.getFullYear() 
        })
        .getRawOne(),

      this.pedidoRepo
        .createQueryBuilder('pedido')
        .select('AVG(pedido.total)', 'media')
        .where('pedido.criadoEm >= :dataInicio', { dataInicio })
        .getRawOne()
    ]);

    const vendas = Number(totalVendas?.total || 0);
    const vendasAnterior = Number(totalVendasAnterior?.total || 0);
    const crescimentoVendas = vendasAnterior > 0 ? ((vendas - vendasAnterior) / vendasAnterior) * 100 : 0;

    return {
      totalVendas: vendas,
      clientesAtivos: Number(clientesAtivos?.count || 0),
      produtosEstoque: Number(produtosEstoque?.total || 0),
      pedidosPendentes,
      faturamentoMes: Number(faturamentoMes?.total || 0),
      crescimentoVendas: Number(crescimentoVendas.toFixed(2)),
      ticketMedio: Number(ticketMedio?.media || 0),
      conversao: 3.2
    };
  }

  async getVendasMensais(ano = new Date().getFullYear()): Promise<VendasMensais[]> {
    const resultado = await this.pedidoRepo
      .createQueryBuilder('pedido')
      .select('EXTRACT(MONTH FROM pedido.criadoEm)', 'mes')
      .addSelect('SUM(pedido.total)', 'vendas')
      .addSelect('COUNT(pedido.id)', 'pedidos')
      .where('EXTRACT(YEAR FROM pedido.criadoEm) = :ano', { ano })
      .groupBy('EXTRACT(MONTH FROM pedido.criadoEm)')
      .orderBy('mes', 'ASC')
      .getRawMany();

    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return meses.map((nome, index) => {
      const dadosMes = resultado.find(r => Number(r.mes) === index + 1);
      return {
        mes: nome,
        vendas: Number(dadosMes?.vendas || 0),
        pedidos: Number(dadosMes?.pedidos || 0)
      };
    });
  }

  async getClientesNovos(periodo = '12m'): Promise<ClientesNovos[]> {
    const agora = new Date();
    const diasAtras = this.getDiasAtras(periodo);
    const dataInicio = new Date(agora.getTime() - diasAtras * 24 * 60 * 60 * 1000);

    const resultado = await this.pedidoRepo
      .createQueryBuilder('pedido')
      .select('EXTRACT(MONTH FROM pedido.criadoEm)', 'mes')
      .addSelect('EXTRACT(YEAR FROM pedido.criadoEm)', 'ano')
      .addSelect('COUNT(DISTINCT pedido.cliente)', 'quantidade')
      .where('pedido.criadoEm >= :dataInicio', { dataInicio })
      .groupBy('EXTRACT(YEAR FROM pedido.criadoEm), EXTRACT(MONTH FROM pedido.criadoEm)')
      .orderBy('ano, mes', 'ASC')
      .getRawMany();

    return resultado.map(r => ({
      periodo: `${r.mes}/${r.ano}`,
      quantidade: Number(r.quantidade)
    }));
  }

  async getProdutosMaisVendidos(limite = 10): Promise<ProdutoMaisVendido[]> {
    const resultado = await this.itemPedidoRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.produto', 'produto')
      .select('produto.id', 'id')
      .addSelect('produto.nome', 'nome')
      .addSelect('SUM(item.quantidade)', 'quantidadeVendida')
      .addSelect('SUM(item.subtotal + item.valorComissao)', 'faturamento')
      .groupBy('produto.id, produto.nome')
      .orderBy('quantidadeVendida', 'DESC')
      .limit(limite)
      .getRawMany();

    return resultado.map(r => ({
      id: r.id,
      nome: r.nome,
      quantidadeVendida: Number(r.quantidadeVendida),
      faturamento: Number(r.faturamento)
    }));
  }

  async getFaturamentoDiario(periodo = '7d'): Promise<FaturamentoDiario[]> {
    const agora = new Date();
    const diasAtras = this.getDiasAtras(periodo);
    const dataInicio = new Date(agora.getTime() - diasAtras * 24 * 60 * 60 * 1000);

    const resultado = await this.pedidoRepo
      .createQueryBuilder('pedido')
      .select('DATE(pedido.criadoEm)', 'dia')
      .addSelect('SUM(pedido.total)', 'faturamento')
      .addSelect('COUNT(pedido.id)', 'pedidos')
      .where('pedido.criadoEm >= :dataInicio', { dataInicio })
      .groupBy('DATE(pedido.criadoEm)')
      .orderBy('dia', 'ASC')
      .getRawMany();

    return resultado.map(r => ({
      dia: new Date(r.dia).toLocaleDateString('pt-BR', { weekday: 'short' }),
      faturamento: Number(r.faturamento),
      pedidos: Number(r.pedidos)
    }));
  }

  async getDistribuicaoCategorias(): Promise<DistribuicaoCategoria[]> {
    const resultado = await this.itemPedidoRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.produto', 'produto')
      .select('produto.categoria', 'categoria')
      .addSelect('SUM(item.quantidade)', 'quantidade')
      .addSelect('SUM(item.subtotal + item.valorComissao)', 'faturamento')
      .where('produto.categoria IS NOT NULL')
      .groupBy('produto.categoria')
      .orderBy('quantidade', 'DESC')
      .getRawMany();

    const totalQuantidade = resultado.reduce((acc, r) => acc + Number(r.quantidade), 0);

    return resultado.map(r => ({
      categoria: r.categoria || 'Sem categoria',
      quantidade: Number(r.quantidade),
      percentual: totalQuantidade > 0 ? Number(((Number(r.quantidade) / totalQuantidade) * 100).toFixed(1)) : 0,
      faturamento: Number(r.faturamento)
    }));
  }

  async getInsights() {
    const [
      produtosBaixoEstoque,
      crescimentoSemanal,
      clienteMaisCompras
    ] = await Promise.all([
      this.produtoRepo.count({ where: { estoque: Between(0, 10) } }),

      this.calcularCrescimentoSemanal(),

      this.pedidoRepo
        .createQueryBuilder('pedido')
        .select('pedido.cliente')
        .addSelect('COUNT(pedido.id)', 'totalPedidos')
        .addSelect('SUM(pedido.total)', 'totalGasto')
        .groupBy('pedido.cliente')
        .orderBy('totalGasto', 'DESC')
        .limit(1)
        .getRawOne()
    ]);

    return {
      produtosBaixoEstoque,
      crescimentoSemanal,
      clienteTop: clienteMaisCompras ? {
        nome: clienteMaisCompras.pedido_cliente,
        pedidos: Number(clienteMaisCompras.totalPedidos),
        totalGasto: Number(clienteMaisCompras.totalGasto)
      } : null,
      alertas: [
        produtosBaixoEstoque > 0 ? {
          tipo: 'warning',
          titulo: 'Produtos em Baixo Estoque',
          mensagem: `${produtosBaixoEstoque} produto(s) precisam ser repostos`,
          acao: 'Verificar Estoque'
        } : null,
        crescimentoSemanal > 0 ? {
          tipo: 'success',
          titulo: 'Crescimento Positivo',
          mensagem: `Vendas cresceram ${crescimentoSemanal.toFixed(1)}% esta semana`,
          acao: 'Ver Detalhes'
        } : null
      ].filter(Boolean)
    };
  }

  private async calcularCrescimentoSemanal(): Promise<number> {
    const agora = new Date();
    const semanaAtual = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const semanaAnterior = new Date(agora.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [vendaSemanaAtual, vendaSemanaAnterior] = await Promise.all([
      this.pedidoRepo
        .createQueryBuilder('pedido')
        .select('SUM(pedido.total)', 'total')
        .where('pedido.criadoEm >= :semanaAtual', { semanaAtual })
        .getRawOne(),

      this.pedidoRepo
        .createQueryBuilder('pedido')
        .select('SUM(pedido.total)', 'total')
        .where('pedido.criadoEm >= :semanaAnterior AND pedido.criadoEm < :semanaAtual', { 
          semanaAnterior, 
          semanaAtual 
        })
        .getRawOne()
    ]);

    const atual = Number(vendaSemanaAtual?.total || 0);
    const anterior = Number(vendaSemanaAnterior?.total || 0);

    return anterior > 0 ? ((atual - anterior) / anterior) * 100 : 0;
  }

  private getDiasAtras(periodo: string): number {
    const periodos: { [key: string]: number } = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '12m': 365
    };
    return periodos[periodo] || 30;
  }
}