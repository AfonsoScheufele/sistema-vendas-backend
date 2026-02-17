import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreditoService } from './credito.service';
import { AcaoBloqueio } from './configuracao-credito.entity';

@Controller('credito')
@UseGuards(JwtAuthGuard)
export class CreditoController {
  constructor(private readonly creditoService: CreditoService) {}

  @Get('verificar/:clienteId')
  async verificar(
    @Param('clienteId') clienteIdStr: string,
    @Req() req: any,
    @Query('valorPedido') valorPedidoStr?: string,
  ) {
    const clienteId = parseInt(clienteIdStr, 10);
    if (Number.isNaN(clienteId)) {
      return { bloqueado: false, mensagem: 'Cliente inválido.' };
    }
    const valorPedido = valorPedidoStr ? parseFloat(valorPedidoStr) : undefined;
    return this.creditoService.verificarCredito(
      clienteId,
      req.empresaId,
      valorPedido,
    );
  }

  @Get('configuracoes')
  async listarConfiguracoes(@Req() req: any) {
    return this.creditoService.listarConfiguracoes(req.empresaId);
  }

  @Get('configuracoes/padrao')
  async obterConfigPadrao(@Req() req: any) {
    return this.creditoService.obterOuCriarConfigPadrao(req.empresaId);
  }

  @Patch('configuracoes')
  async salvarConfig(
    @Req() req: any,
    @Body()
    dto: {
      limiteCreditoPadrao?: number;
      diasToleranciaPadrao?: number;
      acaoBloqueio?: AcaoBloqueio;
      ativo?: boolean;
    },
  ) {
    return this.creditoService.salvarConfig(req.empresaId, dto);
  }
}
