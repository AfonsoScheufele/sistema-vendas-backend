import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Controller('produtos')
export class ProdutosController {
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
  create(@Body() dto: CreateProdutoDto) {
    return this.produtosService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.produtosService.update(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.produtosService.delete(Number(id));
  }
}
