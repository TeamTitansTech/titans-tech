import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import type { AdminNotificationResponse } from '@titans-tech/shared/backend-dtos';

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
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  afterInit() {
    this.logger.log('✅ WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.logger.log(`Client connected: ${client.id}, userId: ${userId}`);

    if (userId) {
      client.join('admin-notifications');
      this.logger.log(
        `User ${userId} (${client.id}) joined admin-notifications room`,
      );
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
  handleNewNotification(notification: AdminNotificationResponse[]) {
    const roomSize =
      this.server.sockets.adapter.rooms.get('admin-notifications')?.size || 0;
    this.logger.log(
      `📤 Broadcasting notification ${notification.map((n) => n.notification.id).join(', ')} to ${roomSize} clients`,
    );

    this.server
      .to('admin-notifications')
      .emit('notification:new', notification);
  }
}
