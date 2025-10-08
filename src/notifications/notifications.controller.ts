import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
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

  @Get('unread-count')
  getUnreadCount(@Req() req: AuthRequest) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, +id);
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@Req() req: AuthRequest) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.notificationsService.delete(req.user.id, +id);
  }
}