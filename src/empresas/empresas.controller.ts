import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { MigracaoService } from './migracao.service';

@Controller('empresas')
export class EmpresasController {
  constructor(
    private readonly empresasService: EmpresasService,
    private readonly migracaoService: MigracaoService,
  ) {}

  @Get()
  listar() {
    return this.empresasService.listarEmpresas();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  obterPorId(@Param('id') id: string) {
    return this.empresasService.obterPorId(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  criar(@Body() dto: CreateEmpresaDto) {
    return this.empresasService.criar(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  atualizar(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    return this.empresasService.atualizar(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  excluir(@Param('id') id: string) {
    return this.empresasService.excluir(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  alterarStatus(@Param('id') id: string, @Body() body: { ativo: boolean }) {
    return this.empresasService.alterarStatus(id, body.ativo);
  }

  @Post('migracao/executar')
  @UseGuards(JwtAuthGuard)
  executarMigracao() {
    return this.migracaoService.executarMigracaoManual();
  }
}

