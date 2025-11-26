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
  CreateAlertCounterbalanceCylinderAirbagSchema,
  CreateAlertCounterbalanceCylinderAirbagDto,
  CreateThresholdSlideDto,
  UpdateThresholdSlideDto,
  CreateThresholdSlideSchema,
  UpdateThresholdSlideSchema,
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
  async getThresholdByBlueprint(@Param('blueprintId') blueprintId: string) {
    return this.alertsService.getThresholdByBlueprint(blueprintId);
  }

  @Admin()
  @Post('bearing-clearance/thresholds')
  async createThreshold(
    @Body(new ZodValidationPipe(CreateThresholdBearingClearanceSchema))
    dto: CreateThresholdBearingClearanceDto,
  ) {
    return this.alertsService.createThreshold(dto);
  }

  @Admin()
  @Put('bearing-clearance/thresholds/blueprint/:blueprintId')
  async updateThreshold(
    @Param('blueprintId') blueprintId: string,
    @Body(new ZodValidationPipe(UpdateThresholdBearingClearanceSchema))
    dto: UpdateThresholdBearingClearanceDto,
  ) {
    return this.alertsService.updateThreshold(blueprintId, dto);
  }

  @Admin()
  @Delete('bearing-clearance/thresholds/blueprint/:blueprintId')
  async deleteThreshold(@Param('blueprintId') blueprintId: string) {
    await this.alertsService.deleteThreshold(blueprintId);
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
    return this.alertsService.updateSlideThreshold(blueprintId, dto);
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
    return this.alertsService.updateSlideThreshold(blueprintId, dto);
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
