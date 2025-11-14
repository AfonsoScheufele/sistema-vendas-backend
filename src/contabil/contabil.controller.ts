import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ContabilService } from './contabil.service';

@Controller('contabil')
@UseGuards(JwtAuthGuard)
export class ContabilController {
  constructor(private readonly contabilService: ContabilService) {}

  @Get('plano-contas')
  async listarPlanoContas(@Req() req: any, @Query('tipo') tipo?: string) {
    return this.contabilService.listarPlanoContas(req.empresaId, { tipo });
  }

  @Post('plano-contas')
  async criarConta(@Body() body: any, @Req() req: any) {
    return this.contabilService.criarConta(req.empresaId, body);
  }

  @Patch('plano-contas/:id')
  async atualizarConta(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.contabilService.atualizarConta(+id, req.empresaId, body);
  }

  @Delete('plano-contas/:id')
  async excluirConta(@Param('id') id: string, @Req() req: any) {
    await this.contabilService.excluirConta(+id, req.empresaId);
    return { message: 'Conta excluída com sucesso' };
  }
}

