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
import { Admin, Authenticated, CompanyManager } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import type { ReqWithAuthUser } from '../../types/request';
import {
  CreateUrgentRequestDto,
  CreateUrgentRequestDtoSchema,
  ClientNotificationResponseDto,
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

  @Get('admin')
  @Admin()
  async getAdminNotifications(
    @Req() req: ReqWithAuthUser,
    @Query('limit') limit?: string,
    @Query('includeRead') includeRead?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const includeReadBool = includeRead === 'true';

    return this.notificationsService.getAdminNotifications(
      req.user.id,
      limitNum,
      includeReadBool,
    );
  }

  @Get('client')
  @Authenticated()
  async getClientNotifications(
    @Req() req: ReqWithAuthUser,
    @Query('limit') limit?: string,
    @Query('includeRead') includeRead?: string,
  ): Promise<ClientNotificationResponseDto[]> {
    const userId = req.user.id;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const includeReadBool = includeRead === 'true';

    return this.notificationsService.getClientNotifications(
      userId,
      limitNum,
      includeReadBool,
    );
  }

  @Patch('admin/:id/read')
  @Admin()
  @HttpCode(HttpStatus.OK)
  async markAdminNotificationAsRead(
    @Param('id') id: string,
    @Req() req: ReqWithAuthUser,
  ): Promise<{ success: boolean }> {
    return this.notificationsService.markAdminNotificationAsRead({
      notificationId: id,
      userId: req.user.id,
    });
  }

  @Patch('client/:id/read')
  @Authenticated()
  @HttpCode(HttpStatus.OK)
  async markClientNotificationAsRead(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.notificationsService.markClientNotificationAsRead(id);
  }

  @Patch('admin/read-all')
  @CompanyManager()
  @HttpCode(HttpStatus.OK)
  async markAllAdminNotificationsAsRead(
    @Req() req: ReqWithAuthUser,
  ): Promise<{ success: boolean; count: number }> {
    return this.notificationsService.markAllAdminNotificationsAsRead(
      req.user.id,
    );
  }

  @Patch('client/read-all')
  @Authenticated()
  @HttpCode(HttpStatus.OK)
  async markAllClientNotificationsAsRead(
    @Req() req: ReqWithAuthUser,
  ): Promise<{ success: boolean; count: number }> {
    const userId = req.user.id;
    return this.notificationsService.markAllClientNotificationsAsRead(userId);
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
