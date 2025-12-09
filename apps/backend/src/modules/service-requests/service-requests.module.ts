import { Module } from '@nestjs/common';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';
import { PrismaService } from '../shared/prisma.service';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EmailModule, NotificationsModule],
  controllers: [ServiceRequestsController],
  providers: [ServiceRequestsService, PrismaService],
  exports: [ServiceRequestsService],
})
export class ServiceRequestsModule {}
