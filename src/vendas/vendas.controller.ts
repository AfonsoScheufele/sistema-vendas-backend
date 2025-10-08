import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { VendasService } from './vendas.service';
import { CreateVendaDto } from './dto/create-venda.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('vendas')
@UseGuards(JwtAuthGuard)
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVendaDto) {
    return this.vendasService.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('vendedorId') vendedorId?: string, @Query('clienteId') clienteId?: string) {
    return this.vendasService.findAll({ status, vendedorId, clienteId });
  }

  @Get('stats')
  getStats(@Query('periodo') periodo?: string) {
    return this.vendasService.getStats(periodo);
  }

  @Get('vendedores')
  getVendedores() {
    return this.vendasService.getVendedores();
  }

  @Get('comissoes')
  getComissoes(@Query('vendedorId') vendedorId?: string, @Query('periodo') periodo?: string) {
    return this.vendasService.getComissoes(vendedorId, periodo);
  }

  @Get('relatorio')
  getRelatorio(@Query('dataInicio') dataInicio?: string, @Query('dataFim') dataFim?: string) {
    return this.vendasService.getRelatorio(dataInicio, dataFim);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendasService.findOne(Number(id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.vendasService.delete(Number(id));
  }
}

// Controller adicional para compatibilidade com o frontend
@Controller('api/vendas')
@UseGuards(JwtAuthGuard)
export class ApiVendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('vendedorId') vendedorId?: string, @Query('clienteId') clienteId?: string) {
    return this.vendasService.findAll({ status, vendedorId, clienteId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendasService.findOne(Number(id));
  }
}
