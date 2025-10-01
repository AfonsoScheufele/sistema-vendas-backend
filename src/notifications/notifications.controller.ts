import { Controller, Get, Post, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { id: number; email: string; role: string };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  getUserNotifications(@Req() req: AuthRequest) {
    return this.notificationsService.findByUser(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, +id);
  }

  @Post('mark-all-read')
  markAllAsRead(@Req() req: AuthRequest) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}