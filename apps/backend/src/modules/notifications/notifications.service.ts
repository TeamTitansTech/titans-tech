import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from './notifications.gateway';
import { appEnv } from '../../config/env';
import { NotificationType } from '@titans-tech/db';
import type {
  AdminNotificationResponseDto,
  ClientNotificationResponseDto,
  NotificationStatsResponseDto,
  CreateUrgentRequestDto,
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
    userId: string,
    dto: CreateUrgentRequestDto,
  ): Promise<{ success: boolean; notificationId: string }> {
    const { machineId, notes } = dto;

    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      include: {
        branch: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = await this.prisma.adminNotification.create({
      data: {
        machineId,
        message: `Urgent service request from ${user.name || user.email} for machine "${machine.name}"`,
        type: NotificationType.URGENT_SERVICE_REQUEST,
        createdByUserId: userId,
        metadata: {
          notes: notes || '',
          companyId: machine.branch.companyId,
          branchId: machine.branchId,
        },
      },
    });

    this.logger.log(
      `Created urgent request notification ${notification.id} for machine ${machineId}`,
    );

    const notificationDto: AdminNotificationResponseDto = {
      id: notification.id,
      machineId: notification.machineId,
      machineName: machine.name,
      message: notification.message,
      isRead: notification.isRead,
      type: notification.type as any,
      createdByUserId: notification.createdByUserId,
      createdByName: user.name || user.email,
      createdByEmail: user.email,
      metadata: notification.metadata as Record<string, any> | null,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    };

    // Broadcast notification to all connected admins via WebSocket
    this.notificationsGateway.handleNewNotification(notificationDto);

    // Get updated stats and broadcast them
    const stats = await this.getAdminNotificationStats(
      machine.branch.companyId,
    );
    this.notificationsGateway.broadcastStatsUpdate(stats);

    const adminEmails = 'xewonip570@delaeb.com';
    const machineUrl = `${appEnv.FRONTEND_URL}/admin/machines/${machineId}?openServiceModal=true`;

    try {
      await this.emailService.sendUrgentRequestEmail(
        adminEmails,
        {
          machineName: machine.name,
          companyName: machine.branch.company.name,
          branchName: machine.branch.name,
          requestedBy: user.name || user.email,
          requestedByEmail: user.email,
          notes,
          machineUrl,
        },
        machineId,
      );

      this.logger.log(
        `Sent urgent request email to ${adminEmails.length} admin(s)`,
      );
    } catch (error) {
      this.logger.error('Failed to send urgent request email', error);
    }

    return {
      success: true,
      notificationId: notification.id,
    };
  }

  async getAdminNotifications(
    companyId: string | null,
    limit: number = 50,
    includeRead: boolean = false,
  ): Promise<AdminNotificationResponseDto[]> {
    const where = {
      ...(companyId
        ? {
            machine: {
              branch: {
                companyId,
              },
            },
          }
        : {}),
      ...(includeRead ? {} : { isRead: false }),
    };

    const notifications = await this.prisma.adminNotification.findMany({
      where,
      include: {
        machine: {
          include: {
            branch: {
              include: {
                company: true,
              },
            },
          },
        },
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      machineId: notification.machineId,
      machineName: notification.machine.name,
      message: notification.message,
      isRead: notification.isRead,
      type: notification.type as any,
      createdByUserId: notification.createdByUserId,
      createdByName:
        notification.createdBy.name || notification.createdBy.email,
      createdByEmail: notification.createdBy.email,
      metadata: notification.metadata as Record<string, any> | null,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    }));
  }

  async getAdminNotificationStats(
    companyId: string | null,
  ): Promise<NotificationStatsResponseDto> {
    const companyFilter = companyId
      ? { machine: { branch: { companyId } } }
      : {};
    const userCompanyFilter = companyId ? { user: { companyId } } : {};

    const [totalUnread, urgentRequests, reminders, overdue] = await Promise.all(
      [
        this.prisma.adminNotification.count({
          where: {
            ...companyFilter,
            isRead: false,
          },
        }),
        this.prisma.adminNotification.count({
          where: {
            ...companyFilter,
            isRead: false,
            type: NotificationType.URGENT_SERVICE_REQUEST,
          },
        }),
        this.prisma.clientNotification.count({
          where: {
            ...userCompanyFilter,
            isRead: false,
            type: NotificationType.SERVICE_REMINDER,
          },
        }),
        this.prisma.clientNotification.count({
          where: {
            ...userCompanyFilter,
            isRead: false,
            type: NotificationType.SERVICE_OVERDUE,
          },
        }),
      ],
    );

    return {
      totalUnread,
      urgentRequests,
      reminders,
      overdue,
    };
  }

  async getClientNotifications(
    userId: string,
    limit: number = 50,
    includeRead: boolean = false,
  ): Promise<ClientNotificationResponseDto[]> {
    const notifications = await this.prisma.clientNotification.findMany({
      where: {
        userId,
        ...(includeRead ? {} : { isRead: false }),
      },
      include: {
        machine: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      userId: notification.userId,
      machineId: notification.machineId,
      machineName: notification.machine?.name || null,
      message: notification.message,
      isRead: notification.isRead,
      redirectUrl: notification.redirectUrl,
      type: notification.type as any,
      metadata: notification.metadata as Record<string, any> | null,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    }));
  }

  async markAdminNotificationAsRead(
    notificationId: string,
  ): Promise<{ success: boolean }> {
    await this.prisma.adminNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { success: true };
  }

  async markClientNotificationAsRead(
    notificationId: string,
  ): Promise<{ success: boolean }> {
    await this.prisma.clientNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { success: true };
  }

  async markAllAdminNotificationsAsRead(
    companyId: string | null,
  ): Promise<{ success: boolean; count: number }> {
    const where = {
      ...(companyId
        ? {
            machine: {
              branch: {
                companyId,
              },
            },
          }
        : {}),
      isRead: false,
    };

    const result = await this.prisma.adminNotification.updateMany({
      where,
      data: {
        isRead: true,
      },
    });

    return {
      success: true,
      count: result.count,
    };
  }

  async markAllClientNotificationsAsRead(
    userId: string,
  ): Promise<{ success: boolean; count: number }> {
    const result = await this.prisma.clientNotification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      success: true,
      count: result.count,
    };
  }
}
