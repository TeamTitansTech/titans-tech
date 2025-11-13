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
} from '@titans-tech/shared';
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
