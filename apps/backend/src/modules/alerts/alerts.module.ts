import { Module } from '@nestjs/common';
import {
  AlertsController,
  AlertsSlideController,
  ClutchAlertsController,
  AlertsGibsController,
  AlertsPistonsController,
} from './alerts.controller';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../shared/prisma.service';

@Module({
  controllers: [
    AlertsController,
    AlertsSlideController,
    ClutchAlertsController,
    AlertsGibsController,
    AlertsPistonsController,
  ],
  providers: [AlertsService, PrismaService],
  exports: [AlertsService],
})
export class AlertsModule {}
