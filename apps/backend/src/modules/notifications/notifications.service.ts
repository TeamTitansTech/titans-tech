import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from './notifications.gateway';
import { notificationsService } from '@titans-tech/shared/services';
import { appEnv } from '../../config/env';
import {
  type CreateUrgentRequestDto,
  type SendAlertNotificationDto,
  NotificationResponse,
} from '@titans-tech/shared/backend-dtos';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createUrgentRequest(
    userId: string | null,
    dto: CreateUrgentRequestDto,
  ): Promise<{ success: boolean; notificationId: string }> {
    const machineUrl = `${appEnv.FRONTEND_URL}/admin/machines/${dto.machineId}?openServiceModal=true`;
    const result = await notificationsService.createUrgentRequest(
      this.prisma,
      userId,
      dto,
      machineUrl,
    );

    if ('error' in result) {
      throw new NotFoundException(result.error.message);
    }

    this.logger.log(
      `Created ${result.isPublicRequest ? 'public' : 'urgent'} request notification ${result.notification.id} for machine ${result.machineId}`,
    );

    this.notificationsGateway.handleNewNotification(result.recipients);

    if (result.sysAdminEmails.length === 0) {
      this.logger.warn(
        'No sysadmin emails found to send urgent request notification',
      );
    }

    try {
      await this.emailService.sendUrgentRequestEmail(
        result.sysAdminEmails,
        result.emailData,
        result.machineId,
      );
      this.logger.log(
        `Sent urgent request email to ${result.sysAdminEmails.length} sysadmin(s): ${result.sysAdminEmails.join(', ')}`,
      );
    } catch (error) {
      this.logger.error('Failed to send urgent request email', error);
    }

    return {
      success: true,
      notificationId: result.notification.id,
    };
  }

  async getNotifications(
    userId: string,
    limit: number = 50,
    includeRead: boolean = false,
  ): Promise<NotificationResponse[]> {
    return notificationsService.getNotifications(
      this.prisma,
      userId,
      limit,
      includeRead,
    );
  }

  async markNotificationAsRead(args: {
    notificationId: string;
    userId: string;
  }): Promise<{ success: boolean }> {
    return notificationsService.markNotificationAsRead(this.prisma, args);
  }

  async markAllNotificationsAsRead(
    userId: string,
  ): Promise<{ success: boolean; count: number }> {
    return notificationsService.markAllNotificationsAsRead(this.prisma, userId);
  }

  async sendAlertNotification(dto: SendAlertNotificationDto): Promise<{
    success: boolean;
    emailsSent: number;
    notificationsCreated: number;
  }> {
    const machineUrl = `${appEnv.FRONTEND_URL}/admin/machines/${dto.serviceId}`;
    const result = await notificationsService.sendAlertNotification(
      this.prisma,
      dto,
      machineUrl,
    );

    if ('error' in result) {
      throw new NotFoundException(result.error.message);
    }

    let emailsSent = 0;
    if (result.allEmails.length > 0) {
      this.logger.log(
        `[Alert Notification] Attempting to send email to: ${result.allEmails.join(', ')}`,
      );
      try {
        await this.emailService.sendAlertNotificationEmail(
          result.allEmails,
          result.emailData,
          result.machineId,
        );
        emailsSent = result.allEmails.length;
        this.logger.log(
          `[Alert Notification] Email sent successfully to ${emailsSent} recipient(s)`,
        );
      } catch (error) {
        this.logger.error('[Alert Notification] Failed to send email:', error);
      }
    } else {
      this.logger.warn('[Alert Notification] No recipients to send email to');
    }

    return {
      success: true,
      emailsSent,
      notificationsCreated: result.notificationsCreated,
    };
  }
}
