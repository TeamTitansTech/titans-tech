import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appEnv } from './config/env';
import { AllExceptionsFilter, ZodErrorFilter } from './errors/error.filter';

async function bootstrap() {
  if (appEnv.NODE_ENV === 'development') {
    console.log(
      `Running in development mode on port http://localhost:${appEnv.PORT}`,
    );
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalFilters(new ZodErrorFilter());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(appEnv.PORT);
}
bootstrap();
