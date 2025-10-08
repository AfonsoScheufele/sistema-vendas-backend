import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { FornecedoresService } from './fornecedores.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('fornecedores')
@UseGuards(JwtAuthGuard)
export class FornecedoresController {
  constructor(private readonly fornecedoresService: FornecedoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFornecedorDto: CreateFornecedorDto) {
    return this.fornecedoresService.create(createFornecedorDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.fornecedoresService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fornecedoresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFornecedorDto: UpdateFornecedorDto) {
    return this.fornecedoresService.update(+id, updateFornecedorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.fornecedoresService.remove(+id);
  }

  @Patch(':id/ativar')
  ativar(@Param('id') id: string) {
    return this.fornecedoresService.ativar(+id);
  }

  @Patch(':id/inativar')
  inativar(@Param('id') id: string) {
    return this.fornecedoresService.inativar(+id);
  }

  @Patch(':id/bloquear')
  bloquear(@Param('id') id: string, @Body() body: { motivo: string }) {
    return this.fornecedoresService.bloquear(+id, body.motivo);
  }

  @Get(':id/produtos')
  obterProdutos(@Param('id') id: string) {
    return this.fornecedoresService.obterProdutos(+id);
  }

  @Post(':id/produtos')
  adicionarProduto(@Param('id') id: string, @Body() produto: any) {
    return this.fornecedoresService.adicionarProduto(+id, produto);
  }

  @Delete(':id/produtos/:produtoId')
  removerProduto(@Param('id') id: string, @Param('produtoId') produtoId: string) {
    return this.fornecedoresService.removerProduto(+id, +produtoId);
  }
}
