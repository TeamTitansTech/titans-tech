import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients = new Map<string, Set<string>>(); // userId -> Set<socketId>

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      this.logger.warn(`Client ${client.id} connected without userId`);
      client.disconnect();
      return;
    }

    // Store client connection
    if (!this.connectedClients.has(userId)) {
      this.connectedClients.set(userId, new Set());
    }
    this.connectedClients.get(userId)!.add(client.id);

    // Join user-specific room
    client.join(`user:${userId}`);

    this.logger.log(
      `Client ${client.id} connected for user ${userId}. Total connections for user: ${this.connectedClients.get(userId)!.size}`,
    );
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId && this.connectedClients.has(userId)) {
      const userClients = this.connectedClients.get(userId)!;
      userClients.delete(client.id);

      if (userClients.size === 0) {
        this.connectedClients.delete(userId);
      }

      this.logger.log(
        `Client ${client.id} disconnected for user ${userId}. Remaining connections: ${userClients.size}`,
      );
    }
  }

  /**
   * Emit new notification to specific user
   */
  emitNotificationToUser(userId: string, notification: any) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized yet');
      return;
    }
    this.server.to(`user:${userId}`).emit('notification:new', notification);
    this.logger.log(`Emitted notification to user ${userId}`);
  }

  /**
   * Emit notification update to all company admins
   */
  emitNotificationToCompany(companyId: string, notification: any) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized yet');
      return;
    }
    this.server
      .to(`company:${companyId}`)
      .emit('notification:new', notification);
    this.logger.log(`Emitted notification to company ${companyId}`);
  }

  /**
   * Emit notification stats update to user
   */
  emitStatsUpdate(userId: string, stats: any) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized yet');
      return;
    }
    this.server.to(`user:${userId}`).emit('notification:stats', stats);
    this.logger.log(`Emitted stats update to user ${userId}`);
  }

  /**
   * Emit notification to all admins (for SysAdmins)
   */
  emitNotificationToAllAdmins(notification: any) {
    if (!this.server) {
      this.logger.warn(
        'WebSocket server not initialized yet, notification will not be emitted in real-time',
      );
      return;
    }

    const connectedCount = this.server.sockets.sockets.size;
    this.logger.log(
      `Emitting notification to all admins. Connected clients: ${connectedCount}`,
    );
    this.logger.log(`Connected users: ${Array.from(this.connectedClients.keys()).join(', ')}`);

    this.server.emit('notification:new', notification);
    this.logger.log('Notification emitted successfully');
  }

  /**
   * Register user to receive company notifications
   */
  registerCompanyListener(socketId: string, companyId: string) {
    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(`company:${companyId}`);
      this.logger.log(
        `Socket ${socketId} joined company room: company:${companyId}`,
      );
    }
  }
}
