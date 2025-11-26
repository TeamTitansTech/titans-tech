import { Module } from '@nestjs/common';
import {
  AlertsController,
  AlertsSlideController,
  ClutchAlertsController,
  AlertsGibsController,
} from './alerts.controller';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../shared/prisma.service';

@Module({
  controllers: [
    AlertsController,
    AlertsSlideController,
    ClutchAlertsController,
    AlertsGibsController,
  ],
  providers: [AlertsService, PrismaService],
  exports: [AlertsService],
})
export class AlertsModule {}
