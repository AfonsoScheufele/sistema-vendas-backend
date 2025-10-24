import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('produtos')
@UseGuards(JwtAuthGuard)
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  create(@Body() createProdutoDto: CreateProdutoDto) {
    return this.produtosService.create(createProdutoDto);
  }

  @Get()
  findAll(@Query('categoria') categoria?: string, @Query('ativo') ativo?: string) {
    return this.produtosService.findAll({ categoria, ativo });
  }

  @Get('stats')
  getStats() {
    return this.produtosService.getStats();
  }

  @Get('categorias')
  getCategorias() {
    return this.produtosService.getCategorias();
  }

  @Get('estoque-baixo')
  getEstoqueBaixo() {
    return this.produtosService.getEstoqueBaixo();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProdutoDto: UpdateProdutoDto) {
    return this.produtosService.update(+id, updateProdutoDto);
  }

  @Patch(':id/estoque')
  updateEstoque(@Param('id') id: string, @Body() body: { estoque: number }) {
    return this.produtosService.updateEstoque(+id, body.estoque, 'entrada');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produtosService.delete(+id);
  }
}


@Controller('api/produtos')
export class ApiProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  findAll() {
    return this.produtosService.findAll();
  }

  @Get('dashboard/stats')
  getDashboardStats() {
    return {
      totalVendas: 0,
      clientesAtivos: 4,
      produtosEstoque: 5,
      pedidosPendentes: 0,
      faturamentoMes: 0,
      crescimentoVendas: 0,
      ticketMedio: 0,
      conversao: 0
    };
  }

  @Get('dashboard/vendas-mensais')
  getVendasMensais() {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return meses.map((nome) => ({
      mes: nome,
      vendas: 0,
      pedidos: 0
    }));
  }

  @Get('dashboard/produtos-mais-vendidos')
  getProdutosMaisVendidos() {
    return [
      { produto: 'Notebook Dell Inspiron', quantidade: 0, faturamento: 0 },
      { produto: 'Mouse Logitech MX Master 3', quantidade: 0, faturamento: 0 },
      { produto: 'Teclado Mecânico Corsair K95', quantidade: 0, faturamento: 0 },
      { produto: 'Monitor Samsung 24"', quantidade: 0, faturamento: 0 },
      { produto: 'Smartphone Samsung Galaxy A54', quantidade: 0, faturamento: 0 }
    ];
  }

  @Get('dashboard/faturamento-diario')
  getFaturamentoDiario() {
    return [
      { data: 'Dom', faturamento: 0 },
      { data: 'Seg', faturamento: 0 },
      { data: 'Ter', faturamento: 0 },
      { data: 'Qua', faturamento: 0 },
      { data: 'Qui', faturamento: 0 },
      { data: 'Sex', faturamento: 0 },
      { data: 'Sáb', faturamento: 0 }
    ];
  }

  @Get('dashboard/distribuicao-categorias')
  getDistribuicaoCategorias() {
    return [
      { categoria: 'Informática', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Periféricos', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Monitores', quantidade: 0, percentual: 0, faturamento: 0 },
      { categoria: 'Smartphones', quantidade: 0, percentual: 0, faturamento: 0 }
    ];
  }

  @Get('dashboard/insights')
  getInsights() {
    return {
      produtosBaixoEstoque: 0,
      crescimentoSemanal: 0,
      clienteTop: null,
      alertas: []
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(+id);
  }
}