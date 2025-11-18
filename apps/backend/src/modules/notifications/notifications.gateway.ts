import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients = new Map<string, Set<string>>();
  private isInitialized = false;
  private pendingNotifications: Array<{
    type: 'user' | 'company' | 'admin' | 'stats';
    data: any;
    target?: string;
  }> = [];

  constructor() {
    this.logger.log('🏗️ NotificationsGateway constructor called!');
  }

  afterInit(server: Server) {
    this.logger.log(
      '📢 afterInit() called! Server parameter received:',
      !!server,
    );
    this.server = server;
    this.markAsInitialized();
  }

  private markAsInitialized() {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    this.logger.log('🚀 NotificationsGateway initialized!');
    this.logger.log(`WebSocket server ready. Server exists: ${!!this.server}`);

    // Emit any pending notifications
    if (this.pendingNotifications.length > 0) {
      this.logger.log(
        `Processing ${this.pendingNotifications.length} pending notifications`,
      );
      const notifications = [...this.pendingNotifications];
      this.pendingNotifications = [];

      notifications.forEach((pending) => {
        switch (pending.type) {
          case 'user':
            this.emitNotificationToUser(pending.target!, pending.data);
            break;
          case 'company':
            this.emitNotificationToCompany(pending.target!, pending.data);
            break;
          case 'admin':
            this.emitNotificationToAllAdmins(pending.data);
            break;
          case 'stats':
            this.emitStatsUpdate(pending.target!, pending.data);
            break;
        }
      });
    }
  }

  private ensureInitialized() {
    // If server is available but not marked as initialized, do it now
    if (!this.isInitialized && this.server) {
      this.logger.log('Lazy initializing gateway (afterInit was not called)');
      this.markAsInitialized();
    }
  }

  handleConnection(client: Socket) {
    // When a client connects, the server should be ready
    this.ensureInitialized();

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
    this.ensureInitialized();

    if (!this.isInitialized || !this.server) {
      this.logger.log(
        `Queueing notification for user ${userId} (server not ready)`,
      );
      this.pendingNotifications.push({
        type: 'user',
        target: userId,
        data: notification,
      });
      return;
    }
    this.server.to(`user:${userId}`).emit('notification:new', notification);
    this.logger.log(`Emitted notification to user ${userId}`);
  }

  /**
   * Emit notification update to all company admins
   */
  emitNotificationToCompany(companyId: string, notification: any) {
    this.ensureInitialized();

    if (!this.isInitialized || !this.server) {
      this.logger.log(
        `Queueing notification for company ${companyId} (server not ready)`,
      );
      this.pendingNotifications.push({
        type: 'company',
        target: companyId,
        data: notification,
      });
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
    this.ensureInitialized();

    if (!this.isInitialized || !this.server) {
      this.logger.log(
        `Queueing stats update for user ${userId} (server not ready)`,
      );
      this.pendingNotifications.push({
        type: 'stats',
        target: userId,
        data: stats,
      });
      return;
    }
    this.server.to(`user:${userId}`).emit('notification:stats', stats);
    this.logger.log(`Emitted stats update to user ${userId}`);
  }

  /**
   * Emit notification to all admins (for SysAdmins)
   */
  emitNotificationToAllAdmins(notification: any) {
    this.ensureInitialized();

    if (!this.isInitialized || !this.server) {
      this.logger.log(`Queueing admin notification (server not ready)`);
      this.pendingNotifications.push({
        type: 'admin',
        data: notification,
      });
      return;
    }

    const connectedCount = this.server.sockets.sockets.size;
    this.logger.log(
      `Emitting notification to all admins. Connected clients: ${connectedCount}`,
    );
    this.logger.log(
      `Connected users: ${Array.from(this.connectedClients.keys()).join(', ')}`,
    );

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
