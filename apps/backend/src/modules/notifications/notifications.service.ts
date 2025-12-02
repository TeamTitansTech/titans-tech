import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from './notifications.gateway';
import { appEnv } from '../../config/env';
import { NotificationType, ServiceStatus, ServiceType } from '@titans-tech/db';
import {
  type CreateUrgentRequestDto,
  type SendAlertNotificationDto,
  NotificationResponse,
  InspectionAlertNotificationMetadataDto,
  UrgentRequestNotificationMetadataDto,
} from '@titans-tech/shared/backend-dtos';
import type { AlertNotificationTemplateData } from '../email/templates/alert-notification.template';

export interface PublicRequestDeviceInfo {
  ipAddress: string;
  userAgent: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
    isMobile: boolean;
  };
}

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
    const { machineId, notes, requesterName, problemDescription } = dto;

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

    // Determina se é requisição autenticada ou pública
    const isPublicRequest = userId === null;
    let user = null;
    let displayName: string;
    let displayEmail: string | null;

    if (isPublicRequest) {
      // Requisição pública via QR code - usa dados do formulário
      displayName = requesterName || 'Anonymous';
      displayEmail = null;
    } else {
      // Requisição autenticada - busca dados do usuário
      user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      displayName = user.name || user.email;
      displayEmail = user.email;
    }

    // Monta a mensagem com notas/descrição do problema
    const problemNote = problemDescription || notes || '';

    // Cria o serviço de manutenção com status PENDING
    const serviceNotes = isPublicRequest
      ? `[PUBLIC REQUEST]\nRequester: ${displayName}\nProblem Description:\n${problemNote}`
      : `[URGENT REQUEST]\nRequested by: ${displayName}\nNotes:\n${problemNote}`;

    const service = await this.prisma.machineService.create({
      data: {
        machine: { connect: { id: machineId } },
        date: new Date(),
        type: ServiceType.MAINTENANCE,
        status: ServiceStatus.PENDING,
        notes: serviceNotes,
        performedBy: isPublicRequest
          ? `Public Request - ${displayName}`
          : `Urgent Request - ${displayName}`,
      },
    });

    this.logger.log(
      `Created ${isPublicRequest ? 'public' : 'urgent'} service request ${service.id} for machine ${machineId}`,
    );

    /** 
    * At the time that this refactor is being made (https://github.com/TeamTitansTech/titans-tech/issues/153),
    * we do not use a message in the frontend for these notifications,
    * so here is the message that should be used in the future if needed.
    * Use it in the i18n logic on the frontend.
    * 
    Inspection alert for machine "${machine.name}" - ${highestSeverity === 'RED' ? 'Critical' : 'Warning'}`;
    * 
    */

    const metadata: UrgentRequestNotificationMetadataDto = {
      type: NotificationType.URGENT_SERVICE_REQUEST,
      machineId,
      machineName: machine.name,
      requestedByUserId: userId,
      requestedByName: user.name,
      notes: notes,
    };

    const admins = await this.prisma.sysAdmin.findMany({
      select: { id: true },
    });

    const notification = await this.prisma.notification.create({
      data: {
        type: NotificationType.URGENT_SERVICE_REQUEST,
        createdByUserId: userId,
        metadata,
        recipients: {
          createMany: {
            data: admins.map((admin) => ({
              recipientId: admin.id,
            })),
          },
        },
      },
    });

    this.logger.log(
      `Created ${isPublicRequest ? 'public' : 'urgent'} request notification ${notification.id} for machine ${machineId}`,
    );

    const recipients = await this.prisma.notificationRecipient.findMany({
      include: { notification: true },
      where: { notificationId: notification.id },
    });
    this.notificationsGateway.handleNewNotification(recipients);

    // Get sysadmin emails only (test emails are added by email service)
    const sysAdmins = await this.prisma.sysAdmin.findMany({
      select: { email: true },
    });
    const sysAdminEmails = sysAdmins.map((sa) => sa.email.toLowerCase());
    const machineUrl = `${appEnv.FRONTEND_URL}/admin/machines/${machineId}?openServiceModal=true`;

    if (sysAdminEmails.length === 0) {
      this.logger.warn(
        'No sysadmin emails found to send urgent request notification',
      );
    }

    try {
      await this.emailService.sendUrgentRequestEmail(
        sysAdminEmails,
        {
          machineName: machine.name,
          companyName: machine.branch.company.name,
          branchName: machine.branch.name,
          requestedBy: displayName,
          requestedByEmail: displayEmail || 'N/A (Public Request)',
          notes: problemNote,
          machineUrl,
        },
        machineId,
      );

      this.logger.log(
        `Sent urgent request email to ${sysAdminEmails.length} sysadmin(s): ${sysAdminEmails.join(', ')}`,
      );
    } catch (error) {
      this.logger.error('Failed to send urgent request email', error);
    }

    return {
      success: true,
      notificationId: notification.id,
    };
  }

  async getNotifications(
    userId: string,
    limit: number = 50,
    includeRead: boolean = false,
  ): Promise<NotificationResponse[]> {
    return await this.prisma.notificationRecipient.findMany({
      where: {
        recipientId: userId,
        ...(includeRead ? {} : { isRead: false }),
      },
      include: {
        notification: true,
      },
      orderBy: {
        notification: {
          createdAt: 'desc',
        },
      },
      take: limit,
    });
  }

  async markNotificationAsRead(args: {
    notificationId: string;
    userId: string;
  }): Promise<{ success: boolean }> {
    await this.prisma.notificationRecipient.update({
      where: {
        notificationId_recipientId: {
          notificationId: args.notificationId,
          recipientId: args.userId,
        },
      },
      data: { isRead: true },
    });

    return { success: true };
  }

  async markAllNotificationsAsRead(
    userId: string,
  ): Promise<{ success: boolean; count: number }> {
    const result = await this.prisma.notificationRecipient.updateMany({
      where: {
        recipientId: userId,
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

    // Fetch service with alerts (get most recent alert for each type)
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
        alertBearingClearance: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertClutch: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertSlide: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertGibs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertCounterbalanceCylinderAirbag: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertPistons: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertTramming: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
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
    if (
      service.alertBearingClearance &&
      service.alertBearingClearance.length > 0
    ) {
      const alert = service.alertBearingClearance[0];
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
    if (service.alertClutch && service.alertClutch.length > 0) {
      const alert = service.alertClutch[0];
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
    if (service.alertSlide && service.alertSlide.length > 0) {
      const alert = service.alertSlide[0];
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
    if (service.alertGibs && service.alertGibs.length > 0) {
      const alert = service.alertGibs[0];
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

    // Process Pistons alerts with subsections (Outer/Inner)
    if (service.alertPistons && service.alertPistons.length > 0) {
      const alert = service.alertPistons[0];
      let sectionSeverity: 'YELLOW' | 'RED' = 'YELLOW';

      // Outer subsection - sum fields
      const outerSumFields = [
        {
          name: 'LH Left+Right',
          severity: alert.outer_lhLeftRight_severity,
          differential: alert.outer_lhLeftRight_diff,
        },
        {
          name: 'LH Top+Bottom',
          severity: alert.outer_lhTopBottom_severity,
          differential: alert.outer_lhTopBottom_diff,
        },
        {
          name: 'RH Left+Right',
          severity: alert.outer_rhLeftRight_severity,
          differential: alert.outer_rhLeftRight_diff,
        },
        {
          name: 'RH Top+Bottom',
          severity: alert.outer_rhTopBottom_severity,
          differential: alert.outer_rhTopBottom_diff,
        },
      ];

      // Inner subsection - sum fields
      const innerSumFields = [
        {
          name: 'LH Left+Right',
          severity: alert.inner_lhLeftRight_severity,
          differential: alert.inner_lhLeftRight_diff,
        },
        {
          name: 'LH Top+Bottom',
          severity: alert.inner_lhTopBottom_severity,
          differential: alert.inner_lhTopBottom_diff,
        },
        {
          name: 'RH Left+Right',
          severity: alert.inner_rhLeftRight_severity,
          differential: alert.inner_rhLeftRight_diff,
        },
        {
          name: 'RH Top+Bottom',
          severity: alert.inner_rhTopBottom_severity,
          differential: alert.inner_rhTopBottom_diff,
        },
      ];

      const outerMeasurements: Array<{
        name: string;
        differential: string;
        status: 'YELLOW' | 'RED';
      }> = [];
      let outerSeverity: 'YELLOW' | 'RED' = 'YELLOW';

      // Add sum alerts
      for (const f of outerSumFields) {
        if (f.severity === 'YELLOW' || f.severity === 'RED') {
          outerMeasurements.push({
            name: f.name,
            differential: f.differential?.toFixed(4) || '0',
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

      // Add sum alerts
      for (const f of innerSumFields) {
        if (f.severity === 'YELLOW' || f.severity === 'RED') {
          innerMeasurements.push({
            name: f.name,
            differential: f.differential?.toFixed(4) || '0',
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
          sectionName: 'Pistons',
          severity: sectionSeverity,
          subsections,
        });
        if (sectionSeverity === 'RED') highestSeverity = 'RED';
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

    const metadata: InspectionAlertNotificationMetadataDto = {
      type: NotificationType.INSPECTION_ALERT,
      serviceId,
      highestSeverity,
      sectionsCount: sections.length,
      machineId,
      machineName: machine.name,
    };

    try {
      const notification = await this.prisma.notification.create({
        include: {
          recipients: {
            select: {
              notificationId: true,
            },
          },
        },
        data: {
          type: NotificationType.INSPECTION_ALERT,
          metadata,
          recipients: {
            createMany: {
              data: selectedUsers.map((u) => ({
                recipientId: u.id,
              })),
            },
          },
        },
      });
      notificationsCreated = notification.recipients.length;
    } catch (error) {
      this.logger.error(`Failed to create notification for users`, error);
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
