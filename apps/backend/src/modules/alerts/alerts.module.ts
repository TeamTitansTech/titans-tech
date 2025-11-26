import { Module } from '@nestjs/common';
import {
  AlertsController,
  AlertsSlideController,
  ClutchAlertsController,
} from './alerts.controller';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../shared/prisma.service';

@Module({
  controllers: [
    AlertsController,
    AlertsSlideController,
    ClutchAlertsController,
  ],
  providers: [AlertsService, PrismaService],
  exports: [AlertsService],
})
export class AlertsModule {}
