import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';

@Controller('compras/contratos')
@UseGuards(JwtAuthGuard)
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  @Get()
  listar(@Req() req: any) {
    return this.contratosService.listar(req.empresaId);
  }

  @Get('stats')
  estatisticas(@Req() req: any) {
    return this.contratosService.obterEstatisticas(req.empresaId);
  }

  @Get(':id')
  obterPorId(@Param('id') id: string, @Req() req: any) {
    return this.contratosService.obterPorId(id, req.empresaId);
  }

  @Post()
  criar(@Body() dto: CreateContratoDto, @Req() req: any) {
    return this.contratosService.criar(dto, req.empresaId);
  }
}
