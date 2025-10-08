import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async create(data: {
    userId: number;
    title: string;
    message?: string;
    type?: 'success' | 'warning' | 'info' | 'error';
    actionUrl?: string;
  }) {
    const notification = this.notificationRepo.create(data);
    return await this.notificationRepo.save(notification);
  }

  async findByUser(userId: number) {
    return await this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(userId: number, id: number) {
    const notification = await this.notificationRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new Error('Notificação não encontrada');
    }

    notification.read = true;
    return await this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepo.update(
      { user: { id: userId }, read: false },
      { read: true }
    );
  }

  async getUnreadCount(userId: number) {
    return await this.notificationRepo.count({
      where: { user: { id: userId }, read: false },
    });
  }

  async delete(userId: number, id: number) {
    const result = await this.notificationRepo.delete({
      id,
      user: { id: userId },
    });
    return result.affected > 0;
  }
}
