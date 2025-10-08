import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CotacoesService } from './cotacoes.service';
import { CreateCotacaoDto } from './dto/create-cotacao.dto';
import { AdicionarPropostaDto, SelecionarVencedoraDto } from './dto/update-cotacao.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('cotacoes')
@UseGuards(JwtAuthGuard)
export class CotacoesController {
  constructor(private readonly cotacoesService: CotacoesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCotacaoDto: CreateCotacaoDto) {
    return this.cotacoesService.create(createCotacaoDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.cotacoesService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cotacoesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCotacaoDto: any) {
    return this.cotacoesService.update(+id, updateCotacaoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.cotacoesService.remove(+id);
  }

  @Post(':id/enviar')
  @HttpCode(HttpStatus.OK)
  enviarParaFornecedor(@Param('id') id: string, @Body() body: { fornecedorId: number }) {
    return this.cotacoesService.enviarParaFornecedor(+id, body.fornecedorId);
  }

  @Post(':id/propostas')
  @HttpCode(HttpStatus.CREATED)
  adicionarProposta(@Param('id') id: string, @Body() propostaDto: AdicionarPropostaDto) {
    return this.cotacoesService.adicionarProposta(+id, propostaDto);
  }

  @Patch(':id/vencedora')
  @HttpCode(HttpStatus.OK)
  selecionarVencedora(@Param('id') id: string, @Body() selecionarDto: SelecionarVencedoraDto) {
    return this.cotacoesService.selecionarVencedora(+id, selecionarDto);
  }

  @Patch(':id/fechar')
  @HttpCode(HttpStatus.OK)
  fechar(@Param('id') id: string) {
    return this.cotacoesService.fechar(+id);
  }

  @Patch(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  cancelar(@Param('id') id: string, @Body() body: { motivo: string }) {
    return this.cotacoesService.cancelar(+id, body.motivo);
  }
}
