import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ComissoesService } from './comissoes.service';
import { CreateComissaoDto } from './dto/create-comissao.dto';
import { UpdateComissaoDto } from './dto/update-comissao.dto';

@Controller('comissoes')
@UseGuards(JwtAuthGuard)
export class ComissoesController {
  constructor(private readonly comissoesService: ComissoesService) {}

  @Get()
  async listar(
    @Req() req: any,
    @Query('status') status?: 'ativo' | 'inativo',
    @Query('search') search?: string,
    @Query('produtoId') produtoId?: string,
  ) {
    const filtros = {
      status,
      search,
      produtoId: produtoId ? Number(produtoId) : undefined,
    };
    return this.comissoesService.listar(req.empresaId, filtros);
  }

  @Get('stats')
  async obterEstatisticas(@Req() req: any) {
    return this.comissoesService.obterEstatisticas(req.empresaId);
  }

  @Get(':id')
  async obterPorId(@Param('id') id: string, @Req() req: any) {
    return this.comissoesService.obterPorId(id, req.empresaId);
  }

  @Post()
  async criar(@Body() dto: CreateComissaoDto, @Req() req: any) {
    return this.comissoesService.criar(req.empresaId, dto);
  }

  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() dto: UpdateComissaoDto,
    @Req() req: any,
  ) {
    return this.comissoesService.atualizar(id, req.empresaId, dto);
  }

  @Delete(':id')
  async remover(@Param('id') id: string, @Req() req: any) {
    await this.comissoesService.remover(id, req.empresaId);
    return { sucesso: true };
  }
}

