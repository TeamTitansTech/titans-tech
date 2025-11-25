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
  CreateThresholdSlideDto,
  UpdateThresholdSlideDto,
} from '@titans-tech/shared/backend-dtos';
import {
  CreateThresholdSlideSchema,
  UpdateThresholdSlideSchema,
} from '@titans-tech/shared/backend-dtos/requests-dto';
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
