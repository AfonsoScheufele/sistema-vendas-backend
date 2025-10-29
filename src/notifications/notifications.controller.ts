import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async listarNotificacoes() {
    return await this.notificationsService.listarNotificacoes();
  }

  @Get('nao-lidas')
  async contarNaoLidas() {
    return { count: await this.notificationsService.contarNaoLidas(1) };
  }

  @Patch(':id/ler')
  async marcarComoLida(@Param('id') id: string) {
    await this.notificationsService.marcarComoLida(+id);
    return { sucesso: true };
  }
}





