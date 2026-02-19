import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { DevolucoesService } from './devolucoes.service';
import { CreateDevolucaoDto, AprovarDevolucaoDto } from './dto/create-devolucao.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('devolucoes')
@UseGuards(JwtAuthGuard)
export class DevolucoesController {
  constructor(private readonly devService: DevolucoesService) {}

  @Post()
  solicitar(@Body() dto: CreateDevolucaoDto, @Req() req: any) {
    return this.devService.solicitar(dto, req.empresaId);
  }

  @Get()
  listar(@Req() req: any) {
    return this.devService.listar(req.empresaId);
  }

  @Get(':id')
  obter(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.devService.obter(id, req.empresaId);
  }

  @Patch(':id/processar')
  processar(@Param('id', ParseIntPipe) id: number, @Body() dto: AprovarDevolucaoDto, @Req() req: any) {
    return this.devService.processar(id, dto, req.empresaId);
  }
}
