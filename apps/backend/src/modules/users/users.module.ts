import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SharedModule } from '../shared/shared.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PasswordResetModule } from '../password-reset/password-reset.module';

@Module({
  imports: [SharedModule, NotificationsModule, PasswordResetModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
