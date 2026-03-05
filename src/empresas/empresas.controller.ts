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
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { MigracaoService } from './migracao.service';
import { UsuarioEmpresaService } from './usuario-empresa.service';

@Controller('empresas')
export class EmpresasController {
  constructor(
    private readonly empresasService: EmpresasService,
    private readonly migracaoService: MigracaoService,
    private readonly usuarioEmpresaService: UsuarioEmpresaService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  listar() {
    return this.empresasService.listarEmpresas();
  }

  /** Empresas do usuário logado (seletor). Deve vir antes de @Get(':id') para não ser capturado como id. */
  @Get('usuarios/minhas-empresas')
  @UseGuards(JwtAuthGuard)
  async listarMinhasEmpresas(@Req() req: any) {
    const empresas = await this.usuarioEmpresaService.listarEmpresasDoUsuario(req.user.id);
    return empresas.map((emp) => ({ id: emp.id, nome: emp.nome, cnpj: emp.cnpj, ativo: emp.ativo }));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  obterPorId(@Param('id') id: string) {
    return this.empresasService.obterPorId(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async criar(@Body() dto: CreateEmpresaDto, @Req() req: any) {
    const empresa = await this.empresasService.criar(dto);
    if (req.user?.id) {
      await this.usuarioEmpresaService.vincularUsuarioEmpresa({
        usuarioId: Number(req.user.id),
        empresaId: empresa.id,
        papel: 'admin',
        ativo: true,
      });
    }
    return empresa;
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

