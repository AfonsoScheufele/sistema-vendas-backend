import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { id: number };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  @Get()
  getUserNotifications(@Req() req: AuthRequest) {
    console.log('REQ.USER:', req.user);
    const userId = req.user.id;

    return [
      { id: 1, title: 'Nova venda', type: 'success', userId },
      { id: 2, title: 'Estoque baixo', type: 'warning', userId },
    ];
  }

  @Post('admin')
  @Roles('Admin')
  sendSystemNotification() {
    return { message: 'Notificação enviada para todos os usuários' };
  }
}
