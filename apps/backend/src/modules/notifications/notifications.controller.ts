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
import { Authenticated, CompanyManager } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import type { ReqWithAuthUser } from '../../types/request';
import { isRegularUser } from '../../types/request';
import {
  CreateUrgentRequestDto,
  CreateUrgentRequestDtoSchema,
  AdminNotificationResponseDto,
  ClientNotificationResponseDto,
  NotificationStatsResponseDto,
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
  @CompanyManager()
  async getAdminNotifications(
    @Req() req: ReqWithAuthUser,
    @Query('limit') limit?: string,
    @Query('includeRead') includeRead?: string,
  ): Promise<AdminNotificationResponseDto[]> {
    const companyId = isRegularUser(req.user) ? req.user.companyId : null;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const includeReadBool = includeRead === 'true';

    return this.notificationsService.getAdminNotifications(
      companyId,
      limitNum,
      includeReadBool,
    );
  }

  @Get('admin/stats')
  @CompanyManager()
  async getAdminNotificationStats(
    @Req() req: ReqWithAuthUser,
  ): Promise<NotificationStatsResponseDto> {
    const companyId = isRegularUser(req.user) ? req.user.companyId : null;
    return this.notificationsService.getAdminNotificationStats(companyId);
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
  @CompanyManager()
  @HttpCode(HttpStatus.OK)
  async markAdminNotificationAsRead(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.notificationsService.markAdminNotificationAsRead(id);
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
    const companyId = isRegularUser(req.user) ? req.user.companyId : null;
    return this.notificationsService.markAllAdminNotificationsAsRead(companyId);
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
}
