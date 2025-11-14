import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
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
  create(@Body() createClienteDto: CreateClienteDto, @Req() req: any) {
    return this.clientesService.create(createClienteDto, req.empresaId);
  }

  @Get()
  findAll(@Req() req: any, @Query('tipo') tipo?: string, @Query('ativo') ativo?: string, @Query('search') search?: string) {
    return this.clientesService.findAll(req.empresaId, { tipo, ativo, search });
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.clientesService.getStats(req.empresaId);
  }

  @Get('tipos')
  getTipos(@Req() req: any) {
    return this.clientesService.getTipos(req.empresaId);
  }

  @Get('novos')
  getClientesNovos(@Req() req: any, @Query('periodo') periodo?: string) {
    return this.clientesService.getClientesNovos(req.empresaId, periodo);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.clientesService.findOne(+id, req.empresaId);
  }

  @Get(':id/vendas')
  getVendasCliente(@Param('id') id: string, @Req() req: any) {
    return this.clientesService.getVendasCliente(+id, req.empresaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto, @Req() req: any) {
    return this.clientesService.update(+id, req.empresaId, updateClienteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.clientesService.remove(+id, req.empresaId);
  }
}
@Controller('api/clientes')
@UseGuards(JwtAuthGuard)
export class ApiClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll(@Req() req: any, @Query('tipo') tipo?: string, @Query('ativo') ativo?: string, @Query('search') search?: string) {
    return this.clientesService.findAll(req.empresaId, { tipo, ativo, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.clientesService.findOne(+id, req.empresaId);
  }
}