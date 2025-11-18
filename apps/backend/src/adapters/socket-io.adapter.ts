import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server as SocketIOServer } from 'socket.io';
import { INestApplicationContext, Logger } from '@nestjs/common';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);
  private ioServer: SocketIOServer | null = null;

  constructor(app: INestApplicationContext) {
    super(app);
    this.logger.log('SocketIOAdapter constructor called');
  }

  create(port: number, options?: ServerOptions): SocketIOServer {
    this.logger.log(`create() called with port: ${port}`);
    this.logger.log(`Options:`, options);

    const server = super.create(port, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.ioServer = server;
    this.logger.log('✅ Socket.IO server created via create() method');
    return server;
  }

  createIOServer(port: number, options?: ServerOptions): any {
    this.logger.log(`createIOServer called with port: ${port}`);
    this.logger.log(`Options:`, options);

    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.ioServer = server;
    this.logger.log('✅ Socket.IO server created and configured successfully');
    this.logger.log(`Server type: ${server.constructor.name}`);
    return server;
  }

  getIoServer(): SocketIOServer | null {
    return this.ioServer;
  }
}
