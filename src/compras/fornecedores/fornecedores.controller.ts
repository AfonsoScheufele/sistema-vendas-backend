import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FornecedoresService } from './fornecedores.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { FornecedorStatus } from './fornecedor.interface';
import { FornecedoresAvancadoService } from '../fornecedores-avancado.service';

@Controller('compras/fornecedores')
@UseGuards(JwtAuthGuard)
export class FornecedoresController {
  constructor(
    private readonly fornecedoresService: FornecedoresService,
    private readonly fornecedoresAvancadoService: FornecedoresAvancadoService,
  ) {}

  @Get()
  listar(
    @Req() req: any,
    @Query('status') status?: FornecedorStatus,
    @Query('search') search?: string,
  ) {
    return this.fornecedoresService.listar(req.empresaId, status, search);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string, @Req() req: any) {
    return this.fornecedoresService.buscarPorId(id, req.empresaId);
  }

  @Post()
  criar(@Body() dto: CreateFornecedorDto, @Req() req: any) {
    return this.fornecedoresService.criar(dto, req.empresaId);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: Partial<CreateFornecedorDto>, @Req() req: any) {
    return this.fornecedoresService.atualizar(id, req.empresaId, dto);
  }

  @Patch(':id/ativar')
  ativar(@Param('id') id: string, @Req() req: any) {
    return this.fornecedoresService.alterarStatus(id, req.empresaId, 'ativo');
  }

  @Patch(':id/inativar')
  inativar(@Param('id') id: string, @Req() req: any) {
    return this.fornecedoresService.alterarStatus(id, req.empresaId, 'inativo');
  }

  @Patch(':id/bloquear')
  bloquear(@Param('id') id: string, @Body('motivo') motivo: string | undefined, @Req() req: any) {
    return this.fornecedoresService.alterarStatus(id, req.empresaId, 'bloqueado', motivo);
  }

  @Delete(':id')
  remover(@Param('id') id: string, @Req() req: any) {
    this.fornecedoresService.remover(id, req.empresaId);
    return { sucesso: true };
  }

  @Get(':id/produtos')
  listarProdutos(@Param('id') id: string, @Req() req: any) {
    return this.fornecedoresService.listarProdutos(id, req.empresaId);
  }

  @Get('stats/resumo')
  obterEstatisticas(@Req() req: any) {
    return this.fornecedoresService.obterEstatisticas(req.empresaId);
  }

  @Get(':id/avaliacoes')
  listarAvaliacoes(@Param('id') id: string, @Req() req: any) {
    return this.fornecedoresAvancadoService.listarAvaliacoes(req.empresaId, +id);
  }

  @Get(':id/avaliacoes/media')
  obterMediaAvaliacao(@Param('id') id: string, @Req() req: any) {
    return this.fornecedoresAvancadoService.obterMediaFornecedor(req.empresaId, +id);
  }

  @Post(':id/avaliacoes')
  criarAvaliacao(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.fornecedoresAvancadoService.criarAvaliacao(req.empresaId, {
      ...body,
      fornecedorId: +id,
    });
  }
}
