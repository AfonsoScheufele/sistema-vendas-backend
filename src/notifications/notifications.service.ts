import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async listarNotificacoes(usuarioId?: number): Promise<Notification[]> {
    const where = usuarioId ? { usuarioId } : {};
    return await this.notificationRepo.find({
      where,
      relations: ['usuario'],
      order: { createdAt: 'DESC' }
    });
  }

  async contarNaoLidas(usuarioId: number): Promise<number> {
    return await this.notificationRepo.count({
      where: { usuarioId, lida: false }
    });
  }

  async marcarComoLida(id: number): Promise<void> {
    await this.notificationRepo.update(id, { lida: true });
  }
}



