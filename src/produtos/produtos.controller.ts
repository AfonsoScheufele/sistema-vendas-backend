import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('produtos')
@UseGuards(JwtAuthGuard)
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  findAll(@Query('categoria') categoria?: string, @Query('ativo') ativo?: string, @Query('search') search?: string) {
    return this.produtosService.findAll({ categoria, ativo, search });
  }

  @Get('categorias')
  getCategorias() {
    return this.produtosService.getCategorias();
  }

  @Get('estoque-baixo')
  getEstoqueBaixo() {
    return this.produtosService.getEstoqueBaixo();
  }

  @Get('stats')
  getStats() {
    return this.produtosService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(Number(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProdutoDto) {
    return this.produtosService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.produtosService.update(Number(id), dto);
  }

  @Patch(':id/estoque')
  updateEstoque(@Param('id') id: string, @Body() body: { quantidade: number; tipo: 'entrada' | 'saida' }) {
    return this.produtosService.updateEstoque(Number(id), body.quantidade, body.tipo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.produtosService.delete(Number(id));
  }
}

// Controller adicional para compatibilidade com o frontend
@Controller('api/produtos')
export class ApiProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  findAll() {
    return this.produtosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(Number(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProdutoDto) {
    return this.produtosService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.produtosService.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.produtosService.delete(Number(id));
  }
}
