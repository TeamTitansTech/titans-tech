import { Module } from '@nestjs/common';
import {
  AlertsController,
  AlertsBearingClearanceSingleHammerController,
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
    AlertsBearingClearanceSingleHammerController,
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
