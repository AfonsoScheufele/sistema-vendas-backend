import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  create(@Body() dto: CreateProdutoDto) {
    return this.produtosService.create(dto);
  }

  @Get()
  findAll() {
    return this.produtosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.produtosService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: Partial<CreateProdutoDto>) {
    return this.produtosService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.produtosService.delete(id);
  }
}
