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
  SendAlertNotificationDto,
} from '@titans-tech/shared/backend-dtos';
import type { AlertNotificationTemplateData } from '../email/templates/alert-notification.template';

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

    const adminEmails = 'tedewa3616@feralrex.com';
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

  async sendAlertNotification(dto: SendAlertNotificationDto): Promise<{
    success: boolean;
    emailsSent: number;
    notificationsCreated: number;
  }> {
    const { serviceId, machineId, selectedUserIds, extraEmails } = dto;

    // Fetch service with alerts
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
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
        alertBearingClearance: true,
        alertClutch: true,
        alertSlide: true,
        alertGibs: true,
        alertCounterbalanceCylinderAirbag: true,
        alertTramming: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const machine = service.machine;
    const machineUrl = `${appEnv.FRONTEND_URL}/admin/machines/${machineId}`;

    // Build alerts summary for email
    const sections: AlertNotificationTemplateData['sections'] = [];
    let highestSeverity: 'YELLOW' | 'RED' = 'YELLOW';

    // Process Bearing Clearance alerts with subsections (Outer/Inner)
    if (service.alertBearingClearance) {
      const alert = service.alertBearingClearance;
      let sectionSeverity: 'YELLOW' | 'RED' = 'YELLOW';

      const outerFields = [
        {
          name: 'Folga Total',
          severity: alert.outer_totalClearance_severity,
          differential: alert.outer_totalClearance_differential,
        },
        {
          name: 'Mancais Principais',
          severity: alert.outer_mainBearings_severity,
          differential: alert.outer_mainBearings_differential,
        },
        {
          name: 'Mancais de Conexão Superior',
          severity: alert.outer_upperConnectionBearings_severity,
          differential: alert.outer_upperConnectionBearings_differential,
        },
        {
          name: 'Pino do Punho para Peça de Acoplamento',
          severity: alert.outer_wristPinToMatingPart_severity,
          differential: alert.outer_wristPinToMatingPart_differential,
        },
        {
          name: 'Pino do Punho para Bucha',
          severity: alert.outer_wristPinToBushing_severity,
          differential: alert.outer_wristPinToBushing_differential,
        },
        {
          name: 'Porca de Ajuste do Slide para Luva do Parafuso',
          severity: alert.outer_slideAdjNutToScrewSleeve_severity,
          differential: alert.outer_slideAdjNutToScrewSleeve_differential,
        },
      ];

      const innerFields = [
        {
          name: 'Folga Total',
          severity: alert.inner_totalClearance_severity,
          differential: alert.inner_totalClearance_differential,
        },
        {
          name: 'Mancais Principais',
          severity: alert.inner_mainBearings_severity,
          differential: alert.inner_mainBearings_differential,
        },
        {
          name: 'Mancais de Conexão Superior',
          severity: alert.inner_upperConnectionBearings_severity,
          differential: alert.inner_upperConnectionBearings_differential,
        },
        {
          name: 'Pino do Punho para Peça de Acoplamento',
          severity: alert.inner_wristPinToMatingPart_severity,
          differential: alert.inner_wristPinToMatingPart_differential,
        },
        {
          name: 'Pino do Punho para Bucha',
          severity: alert.inner_wristPinToBushing_severity,
          differential: alert.inner_wristPinToBushing_differential,
        },
        {
          name: 'Porca de Ajuste do Slide para Luva do Parafuso',
          severity: alert.inner_slideAdjNutToScrewSleeve_severity,
          differential: alert.inner_slideAdjNutToScrewSleeve_differential,
        },
      ];

      const outerMeasurements: Array<{
        name: string;
        differential: string;
        status: 'YELLOW' | 'RED';
      }> = [];
      let outerSeverity: 'YELLOW' | 'RED' = 'YELLOW';

      for (const f of outerFields) {
        if (f.severity === 'YELLOW' || f.severity === 'RED') {
          outerMeasurements.push({
            name: f.name,
            differential: f.differential?.toFixed(3) || '0',
            status: f.severity as 'YELLOW' | 'RED',
          });
          if (f.severity === 'RED') outerSeverity = 'RED';
        }
      }

      const innerMeasurements: Array<{
        name: string;
        differential: string;
        status: 'YELLOW' | 'RED';
      }> = [];
      let innerSeverity: 'YELLOW' | 'RED' = 'YELLOW';

      for (const f of innerFields) {
        if (f.severity === 'YELLOW' || f.severity === 'RED') {
          innerMeasurements.push({
            name: f.name,
            differential: f.differential?.toFixed(3) || '0',
            status: f.severity as 'YELLOW' | 'RED',
          });
          if (f.severity === 'RED') innerSeverity = 'RED';
        }
      }

      const subsections: Array<{
        name: string;
        severity: 'YELLOW' | 'RED';
        measurements: Array<{
          name: string;
          differential: string;
          status: 'YELLOW' | 'RED';
        }>;
      }> = [];

      if (outerMeasurements.length > 0) {
        subsections.push({
          name: 'Outer',
          severity: outerSeverity,
          measurements: outerMeasurements,
        });
        if (outerSeverity === 'RED') sectionSeverity = 'RED';
      }

      if (innerMeasurements.length > 0) {
        subsections.push({
          name: 'Inner',
          severity: innerSeverity,
          measurements: innerMeasurements,
        });
        if (innerSeverity === 'RED') sectionSeverity = 'RED';
      }

      if (subsections.length > 0) {
        sections.push({
          sectionName: 'Bearing Clearance',
          severity: sectionSeverity,
          subsections,
        });
        if (sectionSeverity === 'RED') highestSeverity = 'RED';
      }
    }

    // Process Clutch alerts
    if (service.alertClutch) {
      const alert = service.alertClutch;
      const alerts: Array<{
        fieldLabel: string;
        value: string;
        status: 'YELLOW' | 'RED';
      }> = [];
      let sectionSeverity: 'YELLOW' | 'RED' = 'YELLOW';

      const fields = [
        {
          label: 'Folga Total da Embreagem Hidráulica',
          severity: alert.hydClutchClearanceTotal_severity,
          value: alert.hydClutchClearanceTotal_value,
        },
        {
          label: 'Folga Traseira da Embreagem Hidráulica',
          severity: alert.hydClutchClearanceRear_severity,
          value: alert.hydClutchClearanceRear_value,
        },
        {
          label: 'F-B (Frente-Trás)',
          severity: alert.fb_severity,
          value: alert.fb_value,
        },
        {
          label: 'F-TB (Frente Cima-Baixo)',
          severity: alert.fTB_severity,
          value: alert.fTB_value,
        },
        {
          label: 'R-TB (Trás Cima-Baixo)',
          severity: alert.rTB_severity,
          value: alert.rTB_value,
        },
      ];

      for (const f of fields) {
        if (f.severity === 'YELLOW' || f.severity === 'RED') {
          alerts.push({
            fieldLabel: f.label,
            value: f.value?.toFixed(3) || '0',
            status: f.severity as 'YELLOW' | 'RED',
          });
          if (f.severity === 'RED') sectionSeverity = 'RED';
        }
      }

      if (alerts.length > 0) {
        sections.push({
          sectionName: 'Clutch',
          severity: sectionSeverity,
          alerts,
        });
        if (sectionSeverity === 'RED') highestSeverity = 'RED';
      }
    }

    // Process Slide alerts
    if (service.alertSlide) {
      const alert = service.alertSlide;
      const alerts: Array<{
        fieldLabel: string;
        value: string;
        status: 'YELLOW' | 'RED';
      }> = [];
      let sectionSeverity: 'YELLOW' | 'RED' = 'YELLOW';

      const fields = [
        {
          label: 'Desvio Máximo (Outer)',
          severity: alert.maxDeviationOuter_severity,
          value: alert.maxDeviationOuter_differential,
        },
        {
          label: 'Desvio Máximo (Inner)',
          severity: alert.maxDeviationInner_severity,
          value: alert.maxDeviationInner_differential,
        },
      ];

      for (const f of fields) {
        if (f.severity === 'YELLOW' || f.severity === 'RED') {
          alerts.push({
            fieldLabel: f.label,
            value: f.value?.toFixed(3) || '0',
            status: f.severity as 'YELLOW' | 'RED',
          });
          if (f.severity === 'RED') sectionSeverity = 'RED';
        }
      }

      if (alerts.length > 0) {
        sections.push({
          sectionName: 'Slide',
          severity: sectionSeverity,
          alerts,
        });
        if (sectionSeverity === 'RED') highestSeverity = 'RED';
      }
    }

    // Process Gibs alerts
    if (service.alertGibs) {
      const alert = service.alertGibs;
      if (
        alert.usable_severity === 'YELLOW' ||
        alert.usable_severity === 'RED'
      ) {
        sections.push({
          sectionName: 'Gibs',
          severity: alert.usable_severity as 'YELLOW' | 'RED',
          alerts: [
            {
              fieldLabel: 'Utilizável',
              value: alert.usable_value?.toFixed(3) || '0',
              status: alert.usable_severity as 'YELLOW' | 'RED',
            },
          ],
        });
        if (alert.usable_severity === 'RED') highestSeverity = 'RED';
      }
    }

    // Process Counterbalance alerts
    if (
      service.alertCounterbalanceCylinderAirbag &&
      service.alertCounterbalanceCylinderAirbag.length > 0
    ) {
      const alerts = service.alertCounterbalanceCylinderAirbag.map((a) => ({
        fieldLabel: a.fieldName.replace(/_/g, ' '),
        value: a.justification,
        status: 'RED' as const,
      }));
      sections.push({
        sectionName: 'Counterbalance Cylinder / Airbag',
        severity: 'RED',
        alerts,
      });
      highestSeverity = 'RED';
    }

    // Process Tramming alerts with subsections (Outer/Inner)
    if (service.alertTramming && service.alertTramming.length > 0) {
      const alert = service.alertTramming[0]; // Get first alert record
      let sectionSeverity: 'YELLOW' | 'RED' = 'YELLOW';

      // Helper to process direction measurements (vertical and horizontal)
      const processDirection = (
        position: string,
        verticalSum: any,
        verticalSeverity: string,
        horizontalSum: any,
        horizontalSeverity: string,
      ) => {
        const measurements: Array<{
          name: string;
          differential: string;
          status: 'YELLOW' | 'RED';
        }> = [];

        if (verticalSeverity === 'YELLOW' || verticalSeverity === 'RED') {
          measurements.push({
            name: `${position} - Vertical`,
            differential: verticalSum?.toFixed(3) || '0',
            status: verticalSeverity as 'YELLOW' | 'RED',
          });
        }

        if (horizontalSeverity === 'YELLOW' || horizontalSeverity === 'RED') {
          measurements.push({
            name: `${position} - Horizontal`,
            differential: horizontalSum?.toFixed(3) || '0',
            status: horizontalSeverity as 'YELLOW' | 'RED',
          });
        }

        return measurements;
      };

      // Process OUTER measurements
      const outerMeasurements = [
        ...processDirection(
          'Top',
          alert.outer_top_verticalSum,
          alert.outer_top_verticalSeverity,
          alert.outer_top_horizontalSum,
          alert.outer_top_horizontalSeverity,
        ),
        ...processDirection(
          'Bottom',
          alert.outer_bottom_verticalSum,
          alert.outer_bottom_verticalSeverity,
          alert.outer_bottom_horizontalSum,
          alert.outer_bottom_horizontalSeverity,
        ),
        ...processDirection(
          'Left',
          alert.outer_left_verticalSum,
          alert.outer_left_verticalSeverity,
          alert.outer_left_horizontalSum,
          alert.outer_left_horizontalSeverity,
        ),
        ...processDirection(
          'Right',
          alert.outer_right_verticalSum,
          alert.outer_right_verticalSeverity,
          alert.outer_right_horizontalSum,
          alert.outer_right_horizontalSeverity,
        ),
      ];

      let outerSeverity: 'YELLOW' | 'RED' = 'YELLOW';
      if (outerMeasurements.some((m) => m.status === 'RED')) {
        outerSeverity = 'RED';
      }

      // Process INNER measurements
      const innerMeasurements = [
        ...processDirection(
          'Top',
          alert.inner_top_verticalSum,
          alert.inner_top_verticalSeverity,
          alert.inner_top_horizontalSum,
          alert.inner_top_horizontalSeverity,
        ),
        ...processDirection(
          'Bottom',
          alert.inner_bottom_verticalSum,
          alert.inner_bottom_verticalSeverity,
          alert.inner_bottom_horizontalSum,
          alert.inner_bottom_horizontalSeverity,
        ),
        ...processDirection(
          'Left',
          alert.inner_left_verticalSum,
          alert.inner_left_verticalSeverity,
          alert.inner_left_horizontalSum,
          alert.inner_left_horizontalSeverity,
        ),
        ...processDirection(
          'Right',
          alert.inner_right_verticalSum,
          alert.inner_right_verticalSeverity,
          alert.inner_right_horizontalSum,
          alert.inner_right_horizontalSeverity,
        ),
      ];

      let innerSeverity: 'YELLOW' | 'RED' = 'YELLOW';
      if (innerMeasurements.some((m) => m.status === 'RED')) {
        innerSeverity = 'RED';
      }

      const subsections: Array<{
        name: string;
        severity: 'YELLOW' | 'RED';
        measurements: Array<{
          name: string;
          differential: string;
          status: 'YELLOW' | 'RED';
        }>;
      }> = [];

      if (outerMeasurements.length > 0) {
        subsections.push({
          name: 'Outer',
          severity: outerSeverity,
          measurements: outerMeasurements,
        });
        if (outerSeverity === 'RED') sectionSeverity = 'RED';
      }

      if (innerMeasurements.length > 0) {
        subsections.push({
          name: 'Inner',
          severity: innerSeverity,
          measurements: innerMeasurements,
        });
        if (innerSeverity === 'RED') sectionSeverity = 'RED';
      }

      if (subsections.length > 0) {
        sections.push({
          sectionName: 'Tramming',
          severity: sectionSeverity,
          subsections,
        });
        if (sectionSeverity === 'RED') highestSeverity = 'RED';
      }
    }

    // Prepare email data
    const emailData: AlertNotificationTemplateData = {
      machineName: machine.name,
      companyName: machine.branch.company.name,
      branchName: machine.branch.name,
      inspectionDate: service.date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      performedBy: service.performedBy || 'Not specified',
      machineUrl,
      highestSeverity,
      sections,
    };

    // Get selected users' emails
    const selectedUsers =
      selectedUserIds && selectedUserIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: selectedUserIds } },
            select: { id: true, email: true, name: true },
          })
        : [];

    // Compile all email recipients
    const allEmails: string[] = [
      ...selectedUsers.map((u) => u.email),
      ...(extraEmails || []),
    ];

    let emailsSent = 0;
    let notificationsCreated = 0;

    // Create ClientNotification for each selected user
    for (const user of selectedUsers) {
      try {
        await this.prisma.clientNotification.create({
          data: {
            userId: user.id,
            machineId,
            message: `Inspection alert for machine "${machine.name}" - ${highestSeverity === 'RED' ? 'Critical' : 'Warning'}`,
            redirectUrl: machineUrl,
            type: NotificationType.INSPECTION_ALERT,
            metadata: {
              serviceId,
              highestSeverity,
              sectionsCount: sections.length,
            },
          },
        });
        notificationsCreated++;
      } catch (error) {
        this.logger.error(
          `Failed to create notification for user ${user.id}`,
          error,
        );
      }
    }

    // Send email to all recipients
    if (allEmails.length > 0) {
      this.logger.log(
        `[Alert Notification] Attempting to send email to: ${allEmails.join(', ')}`,
      );
      try {
        await this.emailService.sendAlertNotificationEmail(
          allEmails,
          emailData,
          machineId,
        );
        emailsSent = allEmails.length;
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
      notificationsCreated,
    };
  }
}
