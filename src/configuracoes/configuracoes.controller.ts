import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ConfiguracoesService } from './configuracoes.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

@Controller('configuracoes')
@UseGuards(JwtAuthGuard)
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  @Get()
  async obterConfiguracao(@Req() req: any) {
    return this.configuracoesService.obterConfiguracaoResumida(req.empresaId);
  }

  @Get('completa')
  async obterConfiguracaoCompleta(@Req() req: any) {
    return this.configuracoesService.obterConfiguracao(req.empresaId);
  }

  @Patch()
  async atualizarConfiguracao(@Req() req: any, @Body() dto: UpdateConfiguracaoDto) {
    return this.configuracoesService.atualizarConfiguracao(req.empresaId, dto);
  }
}

