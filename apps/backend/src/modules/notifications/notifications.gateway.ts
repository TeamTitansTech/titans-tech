import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import type { AdminNotificationResponseDto } from '@titans-tech/shared/backend-dtos';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  onModuleInit() {
    this.logger.log('NotificationsGateway module initialized');
  }

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Client subscribes to admin notifications
   * Usage: socket.emit('joinAdminRoom', { userId: 'admin-user-id', role: 'admin' })
   */
  @SubscribeMessage('joinAdminRoom')
  handleJoinAdminRoom(
    client: Socket,
    payload: { userId: string; role: string },
  ) {
    const { userId, role } = payload;

    // Only allow admins to join the admin room
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      client.join('admin-notifications');
      this.logger.log(
        `Admin user ${userId} (${client.id}) joined admin-notifications room`,
      );

      client.emit('joinedAdminRoom', {
        success: true,
        message: 'Successfully joined admin notifications',
      });
    } else {
      this.logger.warn(
        `User ${userId} attempted to join admin room without proper role`,
      );
      client.emit('joinedAdminRoom', {
        success: false,
        message: 'Unauthorized: Admin role required',
      });
    }
  }

  /**
   * Client leaves admin notifications room
   */
  @SubscribeMessage('leaveAdminRoom')
  handleLeaveAdminRoom(client: Socket, payload: { userId: string }) {
    client.leave('admin-notifications');
    this.logger.log(
      `User ${payload.userId} (${client.id}) left admin-notifications room`,
    );

    client.emit('leftAdminRoom', {
      success: true,
      message: 'Left admin notifications room',
    });
  }

  /**
   * Broadcast a new notification to all connected admins
   * This is called from the NotificationsService
   */
  handleNewNotification(notification: AdminNotificationResponseDto) {
    if (!this.server) {
      this.logger.warn(
        'WebSocket server not initialized yet, skipping notification broadcast',
      );
      return;
    }

    this.logger.log(
      `Broadcasting new notification ${notification.id} to admin-notifications room`,
    );

    this.server.to('admin-notifications').emit('newNotification', notification);
  }

  /**
   * Broadcast notification stats update to all admins
   */
  broadcastStatsUpdate(stats: {
    totalUnread: number;
    urgentRequests: number;
    reminders: number;
    overdue: number;
  }) {
    if (!this.server) {
      this.logger.warn(
        'WebSocket server not initialized yet, skipping stats broadcast',
      );
      return;
    }

    this.logger.log('Broadcasting stats update to admin-notifications room');
    this.server
      .to('admin-notifications')
      .emit('notificationStatsUpdate', stats);
  }
}
