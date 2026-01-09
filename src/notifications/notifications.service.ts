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

  async marcarTodasComoLidas(usuarioId: number): Promise<void> {
    try {
      await this.notificationRepo.update(
        { usuarioId, lida: false },
        { lida: true }
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      throw error;
    }
  }

  async criarNotificacao(
    usuarioId: number,
    titulo: string,
    mensagem: string,
    tipo: string = 'info',
    prioridade: string = 'normal',
  ): Promise<Notification> {
    try {
      const notification = this.notificationRepo.create({
        usuarioId,
        titulo,
        mensagem,
        tipo,
        prioridade,
        lida: false,
      });
      return await this.notificationRepo.save(notification);
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  async removerNotificacoesPorMensagem(parteMensagem: string): Promise<number> {
    try {
      const resultado = await this.notificationRepo
        .createQueryBuilder()
        .delete()
        .where('mensagem LIKE :parte', { parte: `%${parteMensagem}%` })
        .orWhere('titulo LIKE :parte', { parte: `%${parteMensagem}%` })
        .execute();
      const removidas = resultado.affected || 0;
      return removidas;
    } catch (error) {
      console.error('Erro ao remover notificações:', error);
      return 0;
    }
  }

  async removerNotificacoesPorBackupId(backupId: string): Promise<number> {
    try {
      const resultado = await this.notificationRepo
        .createQueryBuilder()
        .delete()
        .where('mensagem LIKE :id', { id: `%ID: ${backupId}%` })
        .orWhere('mensagem LIKE :id2', { id2: `%ID:${backupId}%` })
        .execute();
      const removidas = resultado.affected || 0;
      return removidas;
    } catch (error) {
      console.error('Erro ao remover notificações por backup ID:', error);
      return 0;
    }
  }
}
