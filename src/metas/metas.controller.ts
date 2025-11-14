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
import { MetasService } from './metas.service';
import { CreateMetaDto, AtualizarProgressoDto } from './dto/create-meta.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';

@Controller('metas')
@UseGuards(JwtAuthGuard)
export class MetasController {
  constructor(private readonly metasService: MetasService) {}

  @Get()
  async listar(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('tipo') tipo?: string,
    @Query('search') search?: string,
  ) {
    return this.metasService.listar(req.empresaId, {
      status: status as any,
      tipo: tipo as any,
      search,
    });
  }

  @Get('stats')
  async obterEstatisticas(@Req() req: any) {
    return this.metasService.obterEstatisticas(req.empresaId);
  }

  @Get(':id')
  async obterPorId(@Req() req: any, @Param('id') id: string) {
    return this.metasService.obterPorId(req.empresaId, id);
  }

  @Post()
  async criar(@Req() req: any, @Body() dto: CreateMetaDto) {
    return this.metasService.criar(req.empresaId, dto);
  }

  @Patch(':id')
  async atualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateMetaDto) {
    return this.metasService.atualizar(req.empresaId, id, dto);
  }

  @Delete(':id')
  async remover(@Req() req: any, @Param('id') id: string) {
    await this.metasService.remover(req.empresaId, id);
    return { sucesso: true };
  }

  @Get(':id/progresso')
  async listarProgresso(@Req() req: any, @Param('id') id: string) {
    return this.metasService.listarProgresso(req.empresaId, id);
  }

  @Post(':id/progresso')
  async registrarProgresso(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AtualizarProgressoDto,
  ) {
    return this.metasService.registrarProgresso(req.empresaId, id, dto);
  }
}


