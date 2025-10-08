import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PerfisService } from './perfis.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('config/perfis')
@UseGuards(JwtAuthGuard)
export class PerfisController {
  constructor(private readonly perfisService: PerfisService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPerfilDto: any) {
    return this.perfisService.create(createPerfilDto);
  }

  @Get()
  findAll() {
    return this.perfisService.findAll();
  }

  @Get('permissoes')
  obterPermissoes() {
    return this.perfisService.obterPermissoes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePerfilDto: any) {
    return this.perfisService.update(+id, updatePerfilDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.perfisService.remove(+id);
  }
}


