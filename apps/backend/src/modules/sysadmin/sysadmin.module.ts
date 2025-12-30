import { Module } from '@nestjs/common';
import { SysAdminController } from './sysadmin.controller';
import { SysAdminService } from './sysadmin.service';
import { SharedModule } from '../shared/shared.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [SharedModule, NotificationsModule],
  controllers: [SysAdminController],
  providers: [SysAdminService],
})
export class SysAdminModule {}
