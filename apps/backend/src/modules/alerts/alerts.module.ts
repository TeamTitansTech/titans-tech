import { Module } from '@nestjs/common';
import { AlertsController, AlertsSlideController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../shared/prisma.service';

@Module({
  controllers: [AlertsController, AlertsSlideController],
  providers: [AlertsService, PrismaService],
  exports: [AlertsService],
})
export class AlertsModule {}
