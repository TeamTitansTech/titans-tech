import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger, OnModuleInit, OnApplicationBootstrap } from '@nestjs/common';
import type { AdminNotificationResponseDto } from '@titans-tech/shared/backend-dtos';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit,
    OnApplicationBootstrap
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);
  private isServerReady = false;
  private pendingNotifications: AdminNotificationResponseDto[] = [];
  private pendingStats: any[] = [];

  onModuleInit() {
    this.logger.log('📦 NotificationsGateway module initialized');
  }

  afterInit(server: Server) {
    this.logger.log('🔧 afterInit called');
    this.server = server;
    this.isServerReady = true;
    this.logger.log('✅ WebSocket Gateway initialized and server ready');
    this.logger.log(`Server object type: ${server?.constructor?.name}`);
    this.logger.log(`Server adapter: ${server?.adapter?.constructor?.name}`);

    this.processPendingNotifications();
  }

  async onApplicationBootstrap() {
    this.logger.log('🚀 Application bootstrap complete');

    let retries = 0;
    const maxRetries = 10;

    const checkServer = () => {
      if (this.server) {
        this.isServerReady = true;
        this.logger.log('✅ WebSocket server is now ready for broadcasting');
        this.logger.log(`Server initialized after ${retries * 500}ms`);
        this.processPendingNotifications();
      } else if (retries < maxRetries) {
        retries++;
        this.logger.debug(
          `Checking for server... attempt ${retries}/${maxRetries}`,
        );
        setTimeout(checkServer, 500);
      } else {
        this.logger.warn(
          '⚠️ WebSocket server not initialized after 5 seconds. ' +
            'Notifications will be queued until a client connects.',
        );
      }
    };

    checkServer();
  }

  private processPendingNotifications() {
    if (!this.server || !this.isServerReady) {
      return;
    }

    if (this.pendingNotifications.length > 0) {
      this.logger.log(
        `📤 Processing ${this.pendingNotifications.length} queued notifications`,
      );
      for (const notification of this.pendingNotifications) {
        this.server
          .to('admin-notifications')
          .emit('notification:new', notification);
      }
      this.pendingNotifications = [];
    }

    if (this.pendingStats.length > 0) {
      this.logger.log(`📊 Processing ${this.pendingStats.length} queued stats`);
      const latestStats = this.pendingStats[this.pendingStats.length - 1];
      this.server
        .to('admin-notifications')
        .emit('notification:stats', latestStats);
      this.pendingStats = [];
    }
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.logger.log(`Client connected: ${client.id}, userId: ${userId}`);

    if (userId) {
      client.join('admin-notifications');
      this.logger.log(
        `User ${userId} (${client.id}) auto-joined admin-notifications room`,
      );
    }

    if (!this.isServerReady && this.server) {
      this.logger.log('🎉 First client connected - server is now ready!');
      this.isServerReady = true;
      this.processPendingNotifications();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.logger.log(`Client disconnected: ${client.id}, userId: ${userId}`);
  }

  /**
   * Broadcast a new notification to all connected admins
   * This is called from the NotificationsService
   */
  handleNewNotification(notification: AdminNotificationResponseDto) {
    if (!this.isServerReady || !this.server) {
      this.logger.warn(
        `⏳ WebSocket server not ready. Queuing notification ${notification.id} for later broadcast.`,
      );
      this.pendingNotifications.push(notification);
      return;
    }

    const roomSize =
      this.server.sockets.adapter.rooms.get('admin-notifications')?.size || 0;
    this.logger.log(
      `📤 Broadcasting notification ${notification.id} to ${roomSize} clients in admin-notifications room`,
    );

    this.server
      .to('admin-notifications')
      .emit('notification:new', notification);
  }

  broadcastStatsUpdate(stats: {
    totalUnread: number;
    urgentRequests: number;
    reminders: number;
    overdue: number;
  }) {
    if (!this.isServerReady || !this.server) {
      this.logger.warn(
        '⏳ WebSocket server not ready. Queuing stats update for later broadcast.',
      );
      this.pendingStats.push(stats);
      return;
    }

    const roomSize =
      this.server.sockets.adapter.rooms.get('admin-notifications')?.size || 0;
    this.logger.log(
      `📊 Broadcasting stats update to ${roomSize} clients: ${stats.totalUnread} unread`,
    );

    this.server.to('admin-notifications').emit('notification:stats', stats);
  }
}
