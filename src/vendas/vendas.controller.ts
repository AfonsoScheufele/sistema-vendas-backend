import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { VendasService } from './vendas.service';

@Controller('vendas')
@UseGuards(JwtAuthGuard)
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  // Pipeline de Vendas
  @Get('pipeline')
  obterPipeline(@Query() filtros: any) {
    return this.vendasService.obterPipeline(filtros);
  }

  @Post('pipeline')
  @HttpCode(HttpStatus.CREATED)
  criarOportunidade(@Body() createOportunidadeDto: any) {
    return this.vendasService.criarOportunidade(createOportunidadeDto);
  }

  @Get('pipeline/:id')
  obterOportunidade(@Param('id') id: string) {
    return this.vendasService.obterOportunidade(+id);
  }

  @Patch('pipeline/:id')
  atualizarOportunidade(@Param('id') id: string, @Body() updateOportunidadeDto: any) {
    return this.vendasService.atualizarOportunidade(+id, updateOportunidadeDto);
  }

  @Patch('pipeline/:id/etapa')
  atualizarEtapa(@Param('id') id: string, @Body() updateEtapaDto: any) {
    return this.vendasService.atualizarEtapa(+id, updateEtapaDto);
  }

  @Delete('pipeline/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerOportunidade(@Param('id') id: string) {
    return this.vendasService.removerOportunidade(+id);
  }

  // Comissões
  @Get('comissoes')
  obterComissoes(@Query() filtros: any) {
    return this.vendasService.obterComissoes(filtros);
  }

  @Get('comissoes/:id')
  obterComissao(@Param('id') id: string) {
    return this.vendasService.obterComissao(+id);
  }

  @Patch('comissoes/:id/pagar')
  pagarComissao(@Param('id') id: string) {
    return this.vendasService.pagarComissao(+id);
  }

  // Metas
  @Get('metas')
  obterMetas(@Query() filtros: any) {
    return this.vendasService.obterMetas(filtros);
  }

  @Post('metas')
  @HttpCode(HttpStatus.CREATED)
  criarMeta(@Body() createMetaDto: any) {
    return this.vendasService.criarMeta(createMetaDto);
  }

  @Get('metas/:id')
  obterMeta(@Param('id') id: string) {
    return this.vendasService.obterMeta(+id);
  }

  @Patch('metas/:id')
  atualizarMeta(@Param('id') id: string, @Body() updateMetaDto: any) {
    return this.vendasService.atualizarMeta(+id, updateMetaDto);
  }

  @Delete('metas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerMeta(@Param('id') id: string) {
    return this.vendasService.removerMeta(+id);
  }

  // Relatórios de Vendas
  @Get('relatorios/resumo')
  obterResumoVendas(@Query() filtros: any) {
    return this.vendasService.obterResumoVendas(filtros);
  }

  @Get('relatorios/vendedores')
  obterRelatorioVendedores(@Query() filtros: any) {
    return this.vendasService.obterRelatorioVendedores(filtros);
  }

  @Get('relatorios/produtos')
  obterRelatorioProdutos(@Query() filtros: any) {
    return this.vendasService.obterRelatorioProdutos(filtros);
  }
}