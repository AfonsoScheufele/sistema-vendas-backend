import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('produtos')
@UseGuards(JwtAuthGuard)
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  create(@Body() createProdutoDto: CreateProdutoDto, @Req() req: any) {
    return this.produtosService.create(createProdutoDto, req.empresaId);
  }

  @Get()
  findAll(@Req() req: any, @Query('categoria') categoria?: string, @Query('ativo') ativo?: string, @Query('search') search?: string) {
    return this.produtosService.findAll(req.empresaId, { categoria, ativo, search });
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.produtosService.getStats(req.empresaId);
  }

  @Get('categorias')
  getCategorias(@Req() req: any) {
    return this.produtosService.getCategorias(req.empresaId);
  }

  @Get('estoque-baixo')
  getEstoqueBaixo(@Req() req: any) {
    return this.produtosService.getEstoqueBaixo(req.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.produtosService.findOne(+id, req.empresaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProdutoDto: UpdateProdutoDto, @Req() req: any) {
    return this.produtosService.update(+id, req.empresaId, updateProdutoDto);
  }

  @Patch(':id/estoque')
  updateEstoque(@Param('id') id: string, @Body() body: { quantidade: number; tipo?: 'entrada' | 'saida' }, @Req() req: any) {
    const quantidade = Number(body.quantidade ?? 0);
    const tipo = body.tipo ?? 'entrada';
    return this.produtosService.updateEstoque(+id, req.empresaId, quantidade, tipo);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.produtosService.delete(+id, req.empresaId);
  }
}
@Controller('api/produtos')
@UseGuards(JwtAuthGuard)
export class ApiProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  findAll(@Req() req: any, @Query('categoria') categoria?: string, @Query('ativo') ativo?: string, @Query('search') search?: string) {
    return this.produtosService.findAll(req.empresaId, { categoria, ativo, search });
  }

  @Get('dashboard/stats')
  async getDashboardStats(@Req() req: any) {
    const stats = await this.produtosService.getStats(req.empresaId);
    return {
      totalProdutos: stats.total,
      produtosAtivos: stats.ativos,
      produtosInativos: stats.inativos,
      estoqueBaixo: stats.estoqueBaixo,
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
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.produtosService.findOne(+id, req.empresaId);
  }
}