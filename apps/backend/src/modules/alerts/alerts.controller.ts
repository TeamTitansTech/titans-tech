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
  CreateThresholdSlideDto,
  UpdateThresholdSlideDto,
  CreateThresholdSlideSchema,
  UpdateThresholdSlideSchema,
} from '@titans-tech/shared/backend-dtos';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { Admin, Authenticated } from '../auth/auth.decorators';

@Controller('alerts/bearing-clearance')
@UseInterceptors(ClassSerializerInterceptor)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Authenticated()
  @Get('thresholds/blueprint/:blueprintId')
  async getThresholdByBlueprint(@Param('blueprintId') blueprintId: string) {
    return this.alertsService.getThresholdByBlueprint(blueprintId);
  }

  @Admin()
  @Post('thresholds')
  async createThreshold(
    @Body(new ZodValidationPipe(CreateThresholdBearingClearanceSchema))
    dto: CreateThresholdBearingClearanceDto,
  ) {
    return this.alertsService.createThreshold(dto);
  }

  @Admin()
  @Put('thresholds/blueprint/:blueprintId')
  async updateThreshold(
    @Param('blueprintId') blueprintId: string,
    @Body(new ZodValidationPipe(UpdateThresholdBearingClearanceSchema))
    dto: UpdateThresholdBearingClearanceDto,
  ) {
    return this.alertsService.updateThreshold(blueprintId, dto);
  }

  @Admin()
  @Delete('thresholds/blueprint/:blueprintId')
  async deleteThreshold(@Param('blueprintId') blueprintId: string) {
    await this.alertsService.deleteThreshold(blueprintId);
    return { message: 'Threshold deleted successfully' };
  }

  @Authenticated()
  @Get('service/:serviceId')
  async getAlertByService(@Param('serviceId') serviceId: string) {
    return this.alertsService.getAlertByService(serviceId);
  }

  @Admin()
  @Post('service/:serviceId/generate')
  async generateAlerts(@Param('serviceId') serviceId: string) {
    return this.alertsService.generateAlertsForService(serviceId);
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
    return this.alertsService.updateClutchThreshold(blueprintId, dto);
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
