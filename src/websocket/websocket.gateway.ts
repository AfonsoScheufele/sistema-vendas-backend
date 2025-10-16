import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
    credentials: true,
  },
  namespace: '/',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      
      if (!token) {
        this.logger.warn(`Cliente ${client.id} conectou sem token`);
        client.emit('error', { message: 'Token de autenticação necessário' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      this.connectedUsers.set(client.id, payload.sub || payload.id);
      
      this.logger.log(`Usuário ${payload.sub || payload.id} conectado via socket ${client.id}`);
      
      // Notificar que o usuário está online
      client.emit('connected', { 
        message: 'Conectado com sucesso',
        userId: payload.sub || payload.id 
      });

      // Adicionar usuário a uma sala específica
      client.join(`user_${payload.sub || payload.id}`);

    } catch (error) {
      this.logger.error(`Erro na autenticação WebSocket: ${error.message}`);
      client.emit('error', { message: 'Token inválido' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.logger.log(`Usuário ${userId} desconectado do socket ${client.id}`);
      this.connectedUsers.delete(client.id);
    } else {
      this.logger.log(`Cliente ${client.id} desconectado`);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    client.join(data.room);
    this.logger.log(`Cliente ${client.id} entrou na sala ${data.room}`);
    client.emit('joined_room', { room: data.room });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    client.leave(data.room);
    this.logger.log(`Cliente ${client.id} saiu da sala ${data.room}`);
    client.emit('left_room', { room: data.room });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Métodos para enviar notificações
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  sendToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  sendToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  // Método para notificar nova venda
  notifyNewSale(saleData: any) {
    this.sendToAll('new_sale', saleData);
  }

  // Método para notificar atualização de estoque
  notifyStockUpdate(stockData: any) {
    this.sendToAll('stock_update', stockData);
  }

  // Método para notificar nova notificação
  notifyNewNotification(userId: string, notification: any) {
    this.sendToUser(userId, 'new_notification', notification);
  }
}
