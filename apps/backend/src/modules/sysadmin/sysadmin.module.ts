import { Module } from '@nestjs/common';
import { SysAdminController } from './sysadmin.controller';
import { SysAdminService } from './sysadmin.service';
import { SharedModule } from '../shared/shared.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PasswordResetModule } from '../password-reset/password-reset.module';

@Module({
  imports: [SharedModule, NotificationsModule, PasswordResetModule],
  controllers: [SysAdminController],
  providers: [SysAdminService],
})
export class SysAdminModule {}
