import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  findAll(@Query('tipo') tipo?: string, @Query('ativo') ativo?: string, @Query('search') search?: string) {
    return this.clientesService.findAll({ tipo, ativo, search });
  }

  @Get('stats')
  getStats() {
    return this.clientesService.getStats();
  }

  @Get('tipos')
  getTipos() {
    return this.clientesService.getTipos();
  }

  @Get('novos')
  getClientesNovos(@Query('periodo') periodo?: string) {
    return this.clientesService.getClientesNovos(periodo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @Get(':id/vendas')
  getVendasCliente(@Param('id') id: string) {
    return this.clientesService.getVendasCliente(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(+id, updateClienteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.clientesService.remove(+id);
  }
}
@Controller('api/clientes')
@UseGuards(JwtAuthGuard)
export class ApiClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll(@Query('tipo') tipo?: string, @Query('ativo') ativo?: string, @Query('search') search?: string) {
    return this.clientesService.findAll({ tipo, ativo, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }
}