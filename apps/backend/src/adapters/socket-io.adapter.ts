import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server as SocketIOServer } from 'socket.io';
import { INestApplicationContext, Logger } from '@nestjs/common';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);
  private ioServer: SocketIOServer | null = null;

  constructor(app: INestApplicationContext) {
    super(app);
    this.logger.log('🔧 SocketIOAdapter constructor called');
    this.logger.log('📋 Adapter initialization started');
  }

  create(port: number, options?: ServerOptions): SocketIOServer {
    this.logger.log(`🚀 create() called with port: ${port}`);
    this.logger.debug(`Options received:`, JSON.stringify(options, null, 2));

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
    this.logger.log(`📍 Server listening on port: ${port}`);
    return server;
  }

  createIOServer(port: number, options?: ServerOptions): any {
    this.logger.log(`🎯 createIOServer() called with port: ${port}`);
    this.logger.debug(`Options received:`, JSON.stringify(options, null, 2));

    if (!options || !options.cors) {
      this.logger.log('⚙️  Applying default CORS configuration');
      options = {
        ...options,
        cors: {
          origin: '*',
          credentials: true,
          methods: ['GET', 'POST'],
        },
        transports: ['websocket', 'polling'],
      };
    }

    const server = super.createIOServer(port, options);

    this.ioServer = server;
    this.logger.log('✅ Socket.IO server created and configured successfully');
    this.logger.log(`📍 Server type: ${server.constructor.name}`);
    this.logger.log(`🔌 Transports enabled: websocket, polling`);
    this.logger.log(`🌐 CORS configured: enabled`);

    // Set up connection logging
    server.on('connection', (socket: any) => {
      this.logger.log(`🔗 Client connected: ${socket.id}`);
      socket.on('disconnect', () => {
        this.logger.log(`❌ Client disconnected: ${socket.id}`);
      });
    });

    return server;
  }

  getIoServer(): SocketIOServer | null {
    return this.ioServer;
  }
}
