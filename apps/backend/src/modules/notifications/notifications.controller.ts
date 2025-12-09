import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Admin, Authenticated } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import type { ReqWithAuthUser } from '../../types/request';
import {
  CreateUrgentRequestDto,
  CreateUrgentRequestDtoSchema,
  SendAlertNotificationDto,
  SendAlertNotificationDtoSchema,
} from '@titans-tech/shared/backend-dtos';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('urgent-request')
  @Authenticated()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateUrgentRequestDtoSchema))
  async createUrgentRequest(
    @Req() req: ReqWithAuthUser,
    @Body() dto: CreateUrgentRequestDto,
  ): Promise<{ success: boolean; notificationId: string }> {
    const userId = req.user.id;
    return this.notificationsService.createUrgentRequest(userId, dto);
  }

  @Get()
  @Admin()
  async getNotifications(
    @Req() req: ReqWithAuthUser,
    @Query('limit') limit?: string,
    @Query('includeRead') includeRead?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const includeReadBool = includeRead === 'true';

    return this.notificationsService.getNotifications(
      req.user.id,
      limitNum,
      includeReadBool,
    );
  }

  @Patch(':id/read')
  @Admin()
  @HttpCode(HttpStatus.OK)
  async markNotificationAsRead(
    @Param('id') id: string,
    @Req() req: ReqWithAuthUser,
  ): Promise<{ success: boolean }> {
    return this.notificationsService.markNotificationAsRead({
      notificationId: id,
      userId: req.user.id,
    });
  }

  @Patch('read-all')
  @Authenticated()
  @HttpCode(HttpStatus.OK)
  async markAllNotificationsAsRead(
    @Req() req: ReqWithAuthUser,
  ): Promise<{ success: boolean; count: number }> {
    return this.notificationsService.markAllNotificationsAsRead(req.user.id);
  }

  @Post('alert-notification')
  @Authenticated()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(SendAlertNotificationDtoSchema))
  async sendAlertNotification(@Body() dto: SendAlertNotificationDto): Promise<{
    success: boolean;
    emailsSent: number;
    notificationsCreated: number;
  }> {
    return this.notificationsService.sendAlertNotification(dto);
  }
}
