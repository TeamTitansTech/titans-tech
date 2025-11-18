import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appEnv } from './config/env';
import { AllExceptionsFilter, ZodErrorFilter } from './errors/error.filter';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  if (appEnv.NODE_ENV === 'development') {
    console.log(
      `Running in development mode on port http://localhost:${appEnv.PORT}`,
    );
  }

  const app = await NestFactory.create(AppModule);

  // Enable WebSocket with Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.useGlobalFilters(new ZodErrorFilter());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(appEnv.PORT);

  console.log(`HTTP Server running on http://localhost:${appEnv.PORT}`);
  console.log(
    `WebSocket Server running on ws://localhost:${appEnv.PORT}/notifications`,
  );
}
bootstrap();
