import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ConfiguracoesPaginasService, CreateConfiguracaoPaginaDto, UpdateConfiguracaoPaginaDto } from './configuracoes-paginas.service';

@Controller('configuracoes-paginas')
@UseGuards(JwtAuthGuard)
export class ConfiguracoesPaginasController {
  constructor(
    private readonly configService: ConfiguracoesPaginasService,
  ) {}

  @Get()
  async listar(@Req() req: any) {
    const empresaId = req.empresaId;
    if (!empresaId) {
      return [];
    }
    return this.configService.listar(empresaId);
  }

  @Get(':paginaId')
  async obter(@Param('paginaId') paginaId: string, @Req() req: any) {
    const empresaId = req.empresaId;
    if (!empresaId) {
      return null;
    }
    return this.configService.obterConfiguracao(paginaId, empresaId);
  }

  @Post(':paginaId')
  async criar(
    @Param('paginaId') paginaId: string,
    @Body() dto: CreateConfiguracaoPaginaDto,
    @Req() req: any,
  ) {
    const empresaId = req.empresaId;
    if (!empresaId) {
      throw new Error('Empresa não identificada');
    }
    return this.configService.criarOuAtualizar(paginaId, empresaId, dto);
  }

  @Put(':paginaId')
  async atualizar(
    @Param('paginaId') paginaId: string,
    @Body() dto: UpdateConfiguracaoPaginaDto,
    @Req() req: any,
  ) {
    const empresaId = req.empresaId;
    if (!empresaId) {
      throw new Error('Empresa não identificada');
    }
    return this.configService.criarOuAtualizar(paginaId, empresaId, dto);
  }

  @Delete(':paginaId')
  async excluir(@Param('paginaId') paginaId: string, @Req() req: any) {
    const empresaId = req.empresaId;
    if (!empresaId) {
      throw new Error('Empresa não identificada');
    }
    await this.configService.excluir(paginaId, empresaId);
    return { message: 'Configuração excluída com sucesso' };
  }
}

