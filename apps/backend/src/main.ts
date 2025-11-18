import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appEnv } from './config/env';
import { AllExceptionsFilter, ZodErrorFilter } from './errors/error.filter';
import { SocketIOAdapter } from './adapters/socket-io.adapter';

async function bootstrap() {
  try {
    if (appEnv.NODE_ENV === 'development') {
      console.log(
        `Running in development mode on port http://localhost:${appEnv.PORT}`,
      );
    }

    console.log('🔧 Creating NestJS application...');
    const app = await NestFactory.create(AppModule);
    console.log('✅ Application created');

    app.enableCors({
      origin: '*',
      credentials: true,
    });

    // IMPORTANT: Configure WebSocket adapter BEFORE init()
    console.log('🔧 Configuring WebSocket adapter...');
    const ioAdapter = new SocketIOAdapter(app);
    app.useWebSocketAdapter(ioAdapter);
    console.log('✅ WebSocket adapter configured');

    app.useGlobalFilters(new ZodErrorFilter());
    app.useGlobalFilters(new AllExceptionsFilter());

    console.log('🔧 Initializing application...');
    await app.init();
    console.log('✅ Application initialized');

    console.log('🔧 Starting server...');
    await app.listen(appEnv.PORT);
    console.log('✅ Server started');

    // Manually inject the Socket.IO server into the gateway if it wasn't done automatically
    console.log(
      '🔧 Checking if WebSocket gateway needs manual initialization...',
    );
    let ioServer = ioAdapter.getIoServer();

    if (!ioServer) {
      console.log(
        '⚠️ No Socket.IO server found in adapter, creating manually...',
      );
      // Get HTTP server and create Socket.IO server manually
      const httpAdapter = app.getHttpAdapter();
      const httpServer = httpAdapter.getHttpServer();

      console.log('HTTP Server type:', httpServer?.constructor?.name);
      console.log('HTTP Server exists:', !!httpServer);

      if (httpServer) {
        const { Server } = await import('socket.io');
        ioServer = new Server(httpServer, {
          cors: {
            origin: '*',
            credentials: true,
            methods: ['GET', 'POST'],
          },
          transports: ['websocket', 'polling'],
        });
        console.log('✅ Socket.IO server created manually');
      } else {
        console.error('❌ Could not get HTTP server instance');
      }
    }

    if (ioServer) {
      console.log('✅ Socket.IO server is available');
      // Get the NotificationsGateway and manually inject the server
      const { NotificationsGateway } = await import(
        './modules/notifications/notifications.gateway'
      );
      const gateway = app.get(NotificationsGateway);
      if (gateway && !gateway['isInitialized']) {
        console.log('⚠️ Gateway not initialized, manually injecting server...');
        gateway['server'] = ioServer;
        gateway['markAsInitialized']();
        console.log('✅ Gateway manually initialized');
      } else if (gateway && gateway['isInitialized']) {
        console.log('✅ Gateway already initialized');
      }
    } else {
      console.error('❌ Failed to create Socket.IO server');
    }

    console.log(
      `✅ Application is running on: http://localhost:${appEnv.PORT}`,
    );
    console.log(`✅ WebSocket is enabled on: ws://localhost:${appEnv.PORT}`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
