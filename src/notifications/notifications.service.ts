import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private notifications = [
    { id: 1, userId: 1, message: 'Nova venda registrada!', read: false },
    { id: 2, userId: 1, message: 'Novo orçamento criado!', read: false },
  ];

  findByUser(userId: number) {
    return this.notifications.filter(n => n.userId === userId);
  }

  markAsRead(userId: number, id: number) {
    const notif = this.notifications.find(n => n.id === id && n.userId === userId);
    if (notif) notif.read = true;
    return notif || { message: 'Notificação não encontrada' };
  }
}
