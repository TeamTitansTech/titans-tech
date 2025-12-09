import { Module } from '@nestjs/common';
import {
  AlertsController,
  AlertsSlideSingleHammerController,
  AlertsSlideDoubleHammerController,
  ClutchAlertsController,
  AlertsGibsController,
  AlertsTrammingController,
  AlertsPistonsController,
} from './alerts.controller';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../shared/prisma.service';

@Module({
  controllers: [
    AlertsController,
    AlertsSlideSingleHammerController,
    AlertsSlideDoubleHammerController,
    ClutchAlertsController,
    AlertsGibsController,
    AlertsPistonsController,
    AlertsTrammingController,
  ],
  providers: [AlertsService, PrismaService],
  exports: [AlertsService],
})
export class AlertsModule {}
