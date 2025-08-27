import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.clientesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: Partial<CreateClienteDto>) {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.clientesService.delete(id);
  }
}
