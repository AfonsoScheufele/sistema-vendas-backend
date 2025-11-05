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
    try {
      const where = usuarioId ? { usuarioId } : {};
      const notifications = await this.notificationRepo.find({
        where,
        relations: ['usuario'],
        order: { createdAt: 'DESC' }
      });
      return notifications || [];
    } catch (error) {
      console.error('Erro ao listar notificações:', error);
      return [];
    }
  }

  async contarNaoLidas(usuarioId: number): Promise<number> {
    try {
      if (!usuarioId) return 0;
      return await this.notificationRepo.count({
        where: { usuarioId, lida: false }
      });
    } catch (error) {
      console.error('Erro ao contar não lidas:', error);
      return 0;
    }
  }

  async marcarComoLida(id: number): Promise<void> {
    try {
      await this.notificationRepo.update(id, { lida: true });
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      throw error;
    }
  }
}
