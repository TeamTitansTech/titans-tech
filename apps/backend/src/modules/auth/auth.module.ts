import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { appEnv } from '../../config/env';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: appEnv.AUTH_JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
