import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async listarNotificacoes(@Req() req: Request) {
    const usuarioId = (req as any).user?.id;
    return await this.notificationsService.listarNotificacoes(usuarioId);
  }

  @Get('nao-lidas')
  async contarNaoLidas(@Req() req: Request) {
    const usuarioId = (req as any).user?.id;
    return { count: await this.notificationsService.contarNaoLidas(usuarioId || 1) };
  }

  @Patch(':id/ler')
  async marcarComoLida(@Param('id') id: string) {
    await this.notificationsService.marcarComoLida(+id);
    return { sucesso: true };
  }
}
