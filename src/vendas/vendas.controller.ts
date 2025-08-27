import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { VendasService } from './vendas.service';
import { CreateVendaDto } from './dto/create-venda.dto';

@Controller('vendas')
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Post()
  create(@Body() dto: CreateVendaDto) {
    return this.vendasService.create(dto);
  }

  @Get()
  findAll() {
    return this.vendasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.vendasService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.vendasService.delete(id);
  }
}
