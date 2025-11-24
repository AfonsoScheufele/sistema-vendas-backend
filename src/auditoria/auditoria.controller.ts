import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuditoriaService, FiltrosAuditoria } from './auditoria.service';
import { EmpresaContextInterceptor } from '../common/interceptors/empresa-context.interceptor';
import { UseInterceptors } from '@nestjs/common';

@Controller('auditoria')
@UseGuards(JwtAuthGuard)
@UseInterceptors(EmpresaContextInterceptor)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  async listarLogs(@Query() query: any, @Request() req: any) {
    const filtros: FiltrosAuditoria = {
      empresaId: req.empresaId || query.empresaId,
      usuarioId: query.usuarioId ? Number(query.usuarioId) : undefined,
      tipoAcao: query.tipoAcao,
      entidade: query.entidade,
      busca: query.busca,
      pagina: query.pagina ? Number(query.pagina) : 1,
      limite: query.limite ? Number(query.limite) : 50,
    };

    if (query.dataInicio) {
      filtros.dataInicio = new Date(query.dataInicio);
    }
    if (query.dataFim) {
      filtros.dataFim = new Date(query.dataFim);
    }

    return await this.auditoriaService.listarLogs(filtros);
  }

  @Get('estatisticas')
  async obterEstatisticas(@Query() query: any, @Request() req: any) {
    const empresaId = req.empresaId || query.empresaId;
    const dataInicio = query.dataInicio ? new Date(query.dataInicio) : undefined;
    const dataFim = query.dataFim ? new Date(query.dataFim) : undefined;

    return await this.auditoriaService.obterEstatisticas(empresaId, dataInicio, dataFim);
  }

  @Get(':id')
  async obterLogPorId(@Param('id') id: string) {
    return await this.auditoriaService.obterLogPorId(Number(id));
  }
}

