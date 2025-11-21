import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../shared/prisma.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, PrismaService],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
