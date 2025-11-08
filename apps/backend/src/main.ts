import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appEnv } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(appEnv.PORT);
}
bootstrap();
