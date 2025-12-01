import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appEnv } from './config/env';
import { AllExceptionsFilter, ZodErrorFilter } from './errors/error.filter';
import { SocketIOAdapter } from './adapters/socket-io.adapter';

async function bootstrap() {
  if (appEnv.NODE_ENV === 'development') {
    console.log(
      `Running in development mode on port http://localhost:${appEnv.PORT}`,
    );
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.useGlobalFilters(new ZodErrorFilter());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Initialize WebSocket adapter AFTER CORS but BEFORE listen
  const socketAdapter = new SocketIOAdapter(app);
  app.useWebSocketAdapter(socketAdapter);
  console.log('📡 WebSocket adapter configured 1');

  // Start listening - this will trigger WebSocket initialization
  console.log(`🚀 Starting server on port ${appEnv.PORT}...`);
  await app.listen(appEnv.PORT);
  console.log('✅ Server started successfully');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ HTTP Server running on http://localhost:${appEnv.PORT}`);
  console.log(`✅ WebSocket Server running on ws://localhost:${appEnv.PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
bootstrap();
