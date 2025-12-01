import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import {
  CreateThresholdBearingClearanceSchema,
  CreateThresholdBearingClearanceDto,
  UpdateThresholdBearingClearanceSchema,
  UpdateThresholdBearingClearanceDto,
  CreateThresholdClutchSchema,
  CreateThresholdClutchDto,
  UpdateThresholdClutchSchema,
  UpdateThresholdClutchDto,
  CreateAlertCounterbalanceCylinderAirbagSchema,
  CreateAlertCounterbalanceCylinderAirbagDto,
  UpdateAlertCounterbalanceCylinderAirbagSchema,
  UpdateAlertCounterbalanceCylinderAirbagDto,
  CreateThresholdSlideDto,
  UpdateThresholdSlideDto,
  CreateThresholdSlideSchema,
  UpdateThresholdSlideSchema,
  CreateThresholdGibsDto,
  UpdateThresholdGibsDto,
  CreateThresholdGibsSchema,
  UpdateThresholdGibsSchema,
} from '@titans-tech/shared/backend-dtos';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { Admin, Authenticated } from '../auth/auth.decorators';

@Controller('alerts')
@UseInterceptors(ClassSerializerInterceptor)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  // ============================================================================
  // BEARING CLEARANCE - Threshold & Auto-Generated Alerts
  // ============================================================================

  @Authenticated()
  @Get('bearing-clearance/thresholds/blueprint/:blueprintId')
  async getBearingClearanceThresholdByBlueprint(
    @Param('blueprintId') blueprintId: string,
  ) {
    return this.alertsService.getBearingClearanceThresholdByBlueprint(
      blueprintId,
    );
  }

  @Admin()
  @Post('bearing-clearance/thresholds')
  async createBearingClearanceThreshold(
    @Body(new ZodValidationPipe(CreateThresholdBearingClearanceSchema))
    dto: CreateThresholdBearingClearanceDto,
  ) {
    return this.alertsService.createBearingClearanceThreshold(dto);
  }

  @Admin()
  @Put('bearing-clearance/thresholds/blueprint/:blueprintId')
  async updateBearingClearanceThreshold(
    @Param('blueprintId') blueprintId: string,
    @Body(new ZodValidationPipe(UpdateThresholdBearingClearanceSchema))
    dto: UpdateThresholdBearingClearanceDto,
  ) {
    const { recalculateAlerts, ...thresholdData } = dto;

    // Update the threshold
    const threshold = await this.alertsService.updateBearingClearanceThreshold(
      blueprintId,
      thresholdData,
    );

    // If recalculateAlerts is true, regenerate alerts for all services
    if (recalculateAlerts) {
      const recalculationResult =
        await this.alertsService.recalculateBearingClearanceAlertsForBlueprint(
          blueprintId,
        );
      return {
        threshold,
        recalculationResult,
      };
    }

    return { threshold };
  }

  @Admin()
  @Delete('bearing-clearance/thresholds/blueprint/:blueprintId')
  async deleteBearingClearanceThreshold(
    @Param('blueprintId') blueprintId: string,
  ) {
    await this.alertsService.deleteBearingClearanceThreshold(blueprintId);
    return { message: 'Threshold deleted successfully' };
  }

  @Authenticated()
  @Get('bearing-clearance/service/:serviceId')
  async getAlertByService(@Param('serviceId') serviceId: string) {
    return this.alertsService.getAlertByService(serviceId);
  }

  @Admin()
  @Post('bearing-clearance/service/:serviceId/generate')
  async generateAlerts(@Param('serviceId') serviceId: string) {
    return this.alertsService.generateAlertsForService(serviceId);
  }

  // ============================================================================
  // COUNTERBALANCE CYLINDER AIRBAG - Manual Alerts
  // ============================================================================

  @Admin()
  @Post('counterbalance/service/:serviceId')
  async createCounterbalanceAlert(
    @Param('serviceId') serviceId: string,
    @Body(new ZodValidationPipe(CreateAlertCounterbalanceCylinderAirbagSchema))
    dto: CreateAlertCounterbalanceCylinderAirbagDto,
  ) {
    return this.alertsService.createCounterbalanceAlert(serviceId, dto);
  }

  @Authenticated()
  @Get('counterbalance/service/:serviceId')
  async getCounterbalanceAlertsForService(
    @Param('serviceId') serviceId: string,
  ) {
    return this.alertsService.getCounterbalanceAlertsForService(serviceId);
  }

  @Admin()
  @Put('counterbalance/:alertId')
  async updateCounterbalanceAlert(
    @Param('alertId') alertId: string,
    @Body(new ZodValidationPipe(UpdateAlertCounterbalanceCylinderAirbagSchema))
    dto: UpdateAlertCounterbalanceCylinderAirbagDto,
  ) {
    return this.alertsService.updateCounterbalanceAlert(alertId, dto);
  }

  @Admin()
  @Delete('counterbalance/:alertId')
  async deleteCounterbalanceAlert(@Param('alertId') alertId: string) {
    return this.alertsService.deleteCounterbalanceAlert(alertId);
  }
}

@Controller('alerts/clutch')
@UseInterceptors(ClassSerializerInterceptor)
export class ClutchAlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Authenticated()
  @Get('thresholds/blueprint/:blueprintId')
  async getClutchThresholdByBlueprint(
    @Param('blueprintId') blueprintId: string,
  ) {
    return this.alertsService.getClutchThresholdByBlueprint(blueprintId);
  }

  @Admin()
  @Post('thresholds')
  async createClutchThreshold(
    @Body(new ZodValidationPipe(CreateThresholdClutchSchema))
    dto: CreateThresholdClutchDto,
  ) {
    return this.alertsService.createClutchThreshold(dto);
  }

  @Admin()
  @Put('thresholds/blueprint/:blueprintId')
  async updateClutchThreshold(
    @Param('blueprintId') blueprintId: string,
    @Body(new ZodValidationPipe(UpdateThresholdClutchSchema))
    dto: UpdateThresholdClutchDto,
  ) {
    const { recalculateAlerts, ...thresholdData } = dto;

    // Update the threshold
    const threshold = await this.alertsService.updateClutchThreshold(
      blueprintId,
      thresholdData,
    );

    // If recalculateAlerts is true, regenerate alerts for all services
    if (recalculateAlerts) {
      const recalculationResult =
        await this.alertsService.recalculateClutchAlertsForBlueprint(
          blueprintId,
        );
      return {
        threshold,
        recalculationResult,
      };
    }

    return { threshold };
  }

  @Admin()
  @Delete('thresholds/blueprint/:blueprintId')
  async deleteClutchThreshold(@Param('blueprintId') blueprintId: string) {
    await this.alertsService.deleteClutchThreshold(blueprintId);
    return { message: 'Clutch threshold deleted successfully' };
  }

  @Authenticated()
  @Get('service/:serviceId')
  async getClutchAlertByService(@Param('serviceId') serviceId: string) {
    return this.alertsService.getClutchAlertByService(serviceId);
  }

  @Admin()
  @Post('service/:serviceId/generate')
  async generateClutchAlerts(@Param('serviceId') serviceId: string) {
    return this.alertsService.generateClutchAlertsForService(serviceId);
  }
}

@Controller('alerts/slide')
@UseInterceptors(ClassSerializerInterceptor)
export class AlertsSlideController {
  constructor(private readonly alertsService: AlertsService) {}

  @Authenticated()
  @Get('thresholds/blueprint/:blueprintId')
  async getSlideThresholdByBlueprint(
    @Param('blueprintId') blueprintId: string,
  ) {
    return this.alertsService.getSlideThresholdByBlueprint(blueprintId);
  }

  @Admin()
  @Post('thresholds')
  async createSlideThreshold(
    @Body(new ZodValidationPipe(CreateThresholdSlideSchema))
    dto: CreateThresholdSlideDto,
  ) {
    return this.alertsService.createSlideThreshold(dto);
  }

  @Admin()
  @Put('thresholds/blueprint/:blueprintId')
  async updateSlideThreshold(
    @Param('blueprintId') blueprintId: string,
    @Body(new ZodValidationPipe(UpdateThresholdSlideSchema))
    dto: UpdateThresholdSlideDto,
  ) {
    const { recalculateAlerts, ...thresholdData } = dto;

    // Update the threshold
    const threshold = await this.alertsService.updateSlideThreshold(
      blueprintId,
      thresholdData,
    );

    // If recalculateAlerts is true, regenerate alerts for all services
    if (recalculateAlerts) {
      const recalculationResult =
        await this.alertsService.recalculateSlideAlertsForBlueprint(
          blueprintId,
        );
      return {
        threshold,
        recalculationResult,
      };
    }

    return { threshold };
  }

  @Admin()
  @Delete('thresholds/blueprint/:blueprintId')
  async deleteSlideThreshold(@Param('blueprintId') blueprintId: string) {
    return this.alertsService.deleteSlideThreshold(blueprintId);
  }

  @Authenticated()
  @Get('service/:serviceId')
  async getSlideAlertByService(@Param('serviceId') serviceId: string) {
    return this.alertsService.getSlideAlertByService(serviceId);
  }

  @Admin()
  @Post('service/:serviceId/generate')
  async generateSlideAlerts(@Param('serviceId') serviceId: string) {
    return this.alertsService.generateAlertsForSlide(serviceId);
  }
}

@Controller('alerts/gibs')
@UseInterceptors(ClassSerializerInterceptor)
export class AlertsGibsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Authenticated()
  @Get('thresholds/blueprint/:blueprintId')
  async getGibsThresholdByBlueprint(@Param('blueprintId') blueprintId: string) {
    return this.alertsService.getGibsThresholdByBlueprint(blueprintId);
  }

  @Admin()
  @Post('thresholds')
  async createGibsThreshold(
    @Body(new ZodValidationPipe(CreateThresholdGibsSchema))
    dto: CreateThresholdGibsDto,
  ) {
    return this.alertsService.createGibsThreshold(dto);
  }

  @Admin()
  @Put('thresholds/blueprint/:blueprintId')
  async updateGibsThreshold(
    @Param('blueprintId') blueprintId: string,
    @Body(new ZodValidationPipe(UpdateThresholdGibsSchema))
    dto: UpdateThresholdGibsDto,
  ) {
    const { recalculateAlerts, ...thresholdData } = dto;

    // Update the threshold
    const threshold = await this.alertsService.updateGibsThreshold(
      blueprintId,
      thresholdData,
    );

    // If recalculateAlerts is true, regenerate alerts for all services
    if (recalculateAlerts) {
      const recalculationResult =
        await this.alertsService.recalculateGibsAlertsForBlueprint(blueprintId);
      return {
        threshold,
        recalculationResult,
      };
    }

    return { threshold };
  }

  @Admin()
  @Delete('thresholds/blueprint/:blueprintId')
  async deleteGibsThreshold(@Param('blueprintId') blueprintId: string) {
    return this.alertsService.deleteGibsThreshold(blueprintId);
  }

  @Authenticated()
  @Get('service/:serviceId')
  async getGibsAlertByService(@Param('serviceId') serviceId: string) {
    return this.alertsService.getGibsAlertByService(serviceId);
  }

  @Admin()
  @Post('service/:serviceId/generate')
  async generateGibsAlerts(@Param('serviceId') serviceId: string) {
    return this.alertsService.generateAlertsForGibs(serviceId);
  }
}
