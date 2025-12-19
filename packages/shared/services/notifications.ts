import { NotificationType, PrismaClient } from '@titans-tech/db';
import type {
  CreateUrgentRequestDto,
  SendAlertNotificationDto,
  NotificationResponse,
} from '@titans-tech/shared/backend-dtos';
import type {
  AlertNotificationTemplateData,
  UrgentRequestTemplateData,
} from '../email/templates/types';

function notFound(msg: string) {
  return { type: 'NOT_FOUND', message: msg };
}

type Severity = 'YELLOW' | 'RED';

interface AlertMeasurement {
  name: string;
  differential: string;
  status: Severity;
}

interface AlertSubsection {
  name: string;
  severity: Severity;
  measurements: AlertMeasurement[];
}

interface AlertItem {
  fieldLabel: string;
  value: string;
  status: Severity;
}

function processFieldsToMeasurements(
  fields: Array<{ name: string; severity: string | null; differential: number | null }>,
  decimalPlaces = 3,
): { measurements: AlertMeasurement[]; severity: Severity } {
  const measurements: AlertMeasurement[] = [];
  let severity: Severity = 'YELLOW';

  for (const f of fields) {
    if (f.severity === 'YELLOW' || f.severity === 'RED') {
      measurements.push({
        name: f.name,
        differential: f.differential?.toFixed(decimalPlaces) || '0',
        status: f.severity as Severity,
      });
      if (f.severity === 'RED') severity = 'RED';
    }
  }

  return { measurements, severity };
}

function processFieldsToAlerts(
  fields: Array<{ label: string; severity: string | null; value: number | null }>,
): { alerts: AlertItem[]; severity: Severity } {
  const alerts: AlertItem[] = [];
  let severity: Severity = 'YELLOW';

  for (const f of fields) {
    if (f.severity === 'YELLOW' || f.severity === 'RED') {
      alerts.push({
        fieldLabel: f.label,
        value: f.value?.toFixed(3) || '0',
        status: f.severity as Severity,
      });
      if (f.severity === 'RED') severity = 'RED';
    }
  }

  return { alerts, severity };
}

// Return types for shared service functions
// Using 'any' for Prisma return types since exact types depend on runtime Prisma client
// The backend service already has proper types via the Prisma query includes
export interface SendAlertNotificationData {
  machineId: string;
  allEmails: string[];
  notificationsCreated: number;
  emailData: AlertNotificationTemplateData;
}

export type SendAlertNotificationResult =
  | { error: { type: string; message: string } }
  | SendAlertNotificationData;

export interface CreateUrgentRequestData {
  notification: { id: string };
  recipients: NotificationResponse[];
  sysAdminEmails: string[];
  machineId: string;
  emailData: UrgentRequestTemplateData;
  isPublicRequest: boolean;
}

export type CreateUrgentRequestResult =
  | { error: { type: string; message: string } }
  | CreateUrgentRequestData;

export interface BuildAlertEmailDataResult {
  emailData: AlertNotificationTemplateData;
  highestSeverity: Severity;
  sectionsCount: number;
}

function buildAlertEmailData(service: any, machineUrl: string): BuildAlertEmailDataResult {
  const machine = service.machine;
  const sections: AlertNotificationTemplateData['sections'] = [];
  let highestSeverity: Severity = 'YELLOW';

  // Process Bearing Clearance alerts with subsections (Outer/Inner)
  if (service.alertBearingClearance && service.alertBearingClearance.length > 0) {
    const alert = service.alertBearingClearance[0];
    let sectionSeverity: Severity = 'YELLOW';

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

    const outer = processFieldsToMeasurements(outerFields);
    const inner = processFieldsToMeasurements(innerFields);

    const subsections: AlertSubsection[] = [];
    if (outer.measurements.length > 0) {
      subsections.push({
        name: 'Outer',
        severity: outer.severity,
        measurements: outer.measurements,
      });
      if (outer.severity === 'RED') sectionSeverity = 'RED';
    }
    if (inner.measurements.length > 0) {
      subsections.push({
        name: 'Inner',
        severity: inner.severity,
        measurements: inner.measurements,
      });
      if (inner.severity === 'RED') sectionSeverity = 'RED';
    }

    if (subsections.length > 0) {
      sections.push({ sectionName: 'Bearing Clearance', severity: sectionSeverity, subsections });
      if (sectionSeverity === 'RED') highestSeverity = 'RED';
    }
  }

  // Process Clutch alerts
  if (service.alertClutch && service.alertClutch.length > 0) {
    const alert = service.alertClutch[0];
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
      { label: 'F-B (Frente-Trás)', severity: alert.fb_severity, value: alert.fb_value },
      { label: 'F-TB (Frente Cima-Baixo)', severity: alert.fTB_severity, value: alert.fTB_value },
      { label: 'R-TB (Trás Cima-Baixo)', severity: alert.rTB_severity, value: alert.rTB_value },
    ];

    const result = processFieldsToAlerts(fields);
    if (result.alerts.length > 0) {
      sections.push({ sectionName: 'Clutch', severity: result.severity, alerts: result.alerts });
      if (result.severity === 'RED') highestSeverity = 'RED';
    }
  }

  // Process Slide alerts
  if (service.alertSlide && service.alertSlide.length > 0) {
    const alert = service.alertSlide[0];
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

    const result = processFieldsToAlerts(fields);
    if (result.alerts.length > 0) {
      sections.push({ sectionName: 'Slide', severity: result.severity, alerts: result.alerts });
      if (result.severity === 'RED') highestSeverity = 'RED';
    }
  }

  // Process Gibs alerts
  if (service.alertGibs && service.alertGibs.length > 0) {
    const alert = service.alertGibs[0];
    if (alert.usable_severity === 'YELLOW' || alert.usable_severity === 'RED') {
      sections.push({
        sectionName: 'Gibs',
        severity: alert.usable_severity as Severity,
        alerts: [
          {
            fieldLabel: 'Utilizável',
            value: alert.usable_value?.toFixed(3) || '0',
            status: alert.usable_severity as Severity,
          },
        ],
      });
      if (alert.usable_severity === 'RED') highestSeverity = 'RED';
    }
  }

  // Process Pistons alerts with subsections (Outer/Inner)
  if (service.alertPistons && service.alertPistons.length > 0) {
    const alert = service.alertPistons[0];
    let sectionSeverity: Severity = 'YELLOW';

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

    const outer = processFieldsToMeasurements(outerSumFields, 4);
    const inner = processFieldsToMeasurements(innerSumFields, 4);

    const subsections: AlertSubsection[] = [];
    if (outer.measurements.length > 0) {
      subsections.push({
        name: 'Outer',
        severity: outer.severity,
        measurements: outer.measurements,
      });
      if (outer.severity === 'RED') sectionSeverity = 'RED';
    }
    if (inner.measurements.length > 0) {
      subsections.push({
        name: 'Inner',
        severity: inner.severity,
        measurements: inner.measurements,
      });
      if (inner.severity === 'RED') sectionSeverity = 'RED';
    }

    if (subsections.length > 0) {
      sections.push({ sectionName: 'Pistons', severity: sectionSeverity, subsections });
      if (sectionSeverity === 'RED') highestSeverity = 'RED';
    }
  }

  // Process Counterbalance alerts
  if (
    service.alertCounterbalanceCylinderAirbag &&
    service.alertCounterbalanceCylinderAirbag.length > 0
  ) {
    const alerts = service.alertCounterbalanceCylinderAirbag.map((a: any) => ({
      fieldLabel: a.fieldName.replace(/_/g, ' '),
      value: a.justification,
      status: 'RED' as const,
    }));
    sections.push({ sectionName: 'Counterbalance Cylinder / Airbag', severity: 'RED', alerts });
    highestSeverity = 'RED';
  }

  // Process Tramming alerts with subsections (Outer/Inner)
  if (service.alertTramming && service.alertTramming.length > 0) {
    const alert = service.alertTramming[0];
    let sectionSeverity: Severity = 'YELLOW';

    const processDirection = (
      position: string,
      verticalSum: number | null,
      verticalSeverity: string | null,
      horizontalSum: number | null,
      horizontalSeverity: string | null,
    ): AlertMeasurement[] => {
      const measurements: AlertMeasurement[] = [];
      if (verticalSeverity === 'YELLOW' || verticalSeverity === 'RED') {
        measurements.push({
          name: `${position} - Vertical`,
          differential: verticalSum?.toFixed(3) || '0',
          status: verticalSeverity as Severity,
        });
      }
      if (horizontalSeverity === 'YELLOW' || horizontalSeverity === 'RED') {
        measurements.push({
          name: `${position} - Horizontal`,
          differential: horizontalSum?.toFixed(3) || '0',
          status: horizontalSeverity as Severity,
        });
      }
      return measurements;
    };

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

    const outerSeverity: Severity = outerMeasurements.some((m) => m.status === 'RED')
      ? 'RED'
      : 'YELLOW';
    const innerSeverity: Severity = innerMeasurements.some((m) => m.status === 'RED')
      ? 'RED'
      : 'YELLOW';

    const subsections: AlertSubsection[] = [];
    if (outerMeasurements.length > 0) {
      subsections.push({ name: 'Outer', severity: outerSeverity, measurements: outerMeasurements });
      if (outerSeverity === 'RED') sectionSeverity = 'RED';
    }
    if (innerMeasurements.length > 0) {
      subsections.push({ name: 'Inner', severity: innerSeverity, measurements: innerMeasurements });
      if (innerSeverity === 'RED') sectionSeverity = 'RED';
    }

    if (subsections.length > 0) {
      sections.push({ sectionName: 'Tramming', severity: sectionSeverity, subsections });
      if (sectionSeverity === 'RED') highestSeverity = 'RED';
    }
  }

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

  return { emailData, highestSeverity, sectionsCount: sections.length };
}

export const notificationsService = {
  async createUrgentRequest(
    prisma: PrismaClient,
    userId: string | null,
    dto: CreateUrgentRequestDto,
    machineUrl: string,
  ): Promise<CreateUrgentRequestResult> {
    const { machineId, notes, requesterName, problemDescription } = dto;

    const machine = await prisma.machine.findUnique({
      where: { id: machineId },
      include: { branch: { include: { company: true } } },
    });
    if (!machine) {
      return { error: notFound('Machine not found') };
    }

    const isPublicRequest = userId === null;
    let displayName: string;
    let displayEmail: string | null;

    if (isPublicRequest) {
      displayName = requesterName || 'Anonymous';
      displayEmail = null;
    } else {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return { error: notFound('User not found') };
      }
      displayName = user.name || user.email;
      displayEmail = user.email;
    }

    const problemNote = problemDescription || notes || '';

    const serviceNotes = isPublicRequest
      ? `[PUBLIC REQUEST]\nRequester: ${displayName}\nProblem Description:\n${problemNote}`
      : `[URGENT REQUEST]\nRequested by: ${displayName}\nNotes:\n${problemNote}`;

    await prisma.machineService.create({
      data: {
        machine: { connect: { id: machineId } },
        date: new Date(),
        type: 'MAINTENANCE',
        status: 'PENDING',
        notes: serviceNotes,
        performedBy: isPublicRequest
          ? `Public Request - ${displayName}`
          : `Urgent Request - ${displayName}`,
      },
    });

    const metadata = {
      type: NotificationType.URGENT_SERVICE_REQUEST,
      machineId,
      machineName: machine.name,
      requestedByUserId: userId,
      requestedByName: displayName,
      notes,
    };

    const admins = await prisma.sysAdmin.findMany({ select: { id: true } });

    const notification = await prisma.notification.create({
      data: {
        type: NotificationType.URGENT_SERVICE_REQUEST,
        createdByUserId: userId,
        metadata: metadata as any,
        recipients: { createMany: { data: admins.map((a) => ({ recipientId: a.id })) } },
      },
      include: { recipients: true },
    });

    const recipients = await prisma.notificationRecipient.findMany({
      where: { notificationId: notification.id },
      include: { notification: true },
    });

    const sysAdmins = await prisma.sysAdmin.findMany({ select: { email: true } });
    const sysAdminEmails = sysAdmins.map((sa) => sa.email.toLowerCase());

    const emailData: UrgentRequestTemplateData = {
      machineName: machine.name,
      companyName: machine.branch.company.name,
      branchName: machine.branch.name,
      requestedBy: displayName,
      requestedByEmail: displayEmail || 'N/A (Public Request)',
      notes: problemNote,
      machineUrl,
    };

    return {
      notification: { id: notification.id },
      recipients,
      sysAdminEmails,
      machineId: machine.id,
      emailData,
      isPublicRequest,
    };
  },

  async getNotifications(prisma: PrismaClient, userId: string, limit = 50, includeRead = false) {
    return prisma.notificationRecipient.findMany({
      where: { recipientId: userId, ...(includeRead ? {} : { isRead: false }) },
      include: { notification: true },
      orderBy: { notification: { createdAt: 'desc' } },
      take: limit,
    });
  },

  async markNotificationAsRead(
    prisma: PrismaClient,
    args: { notificationId: string; userId: string },
  ) {
    await prisma.notificationRecipient.update({
      where: {
        notificationId_recipientId: {
          notificationId: args.notificationId,
          recipientId: args.userId,
        },
      },
      data: { isRead: true },
    });
    return { success: true };
  },

  async markAllNotificationsAsRead(prisma: PrismaClient, userId: string) {
    const result = await prisma.notificationRecipient.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true, count: result.count };
  },

  async getServiceWithAlerts(prisma: PrismaClient, serviceId: string) {
    const service = await prisma.machineService.findUnique({
      where: { id: serviceId },
      include: {
        machine: { include: { branch: { include: { company: true } } } },
        alertBearingClearance: { orderBy: { createdAt: 'desc' }, take: 1 },
        alertClutch: { orderBy: { createdAt: 'desc' }, take: 1 },
        alertSlide: { orderBy: { createdAt: 'desc' }, take: 1 },
        alertGibs: { orderBy: { createdAt: 'desc' }, take: 1 },
        alertCounterbalanceCylinderAirbag: { orderBy: { createdAt: 'desc' }, take: 1 },
        alertPistons: { orderBy: { createdAt: 'desc' }, take: 1 },
        alertTramming: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!service) return { error: { type: 'NOT_FOUND', message: 'Service not found' } };
    return { data: service };
  },

  async sendAlertNotification(
    prisma: PrismaClient,
    dto: SendAlertNotificationDto,
    machineUrl: string,
  ): Promise<SendAlertNotificationResult> {
    const { serviceId, selectedUserIds, extraEmails } = dto;

    const serviceResult = await notificationsService.getServiceWithAlerts(prisma, serviceId);
    if (serviceResult.error) {
      return { error: serviceResult.error };
    }

    const service = serviceResult.data!;
    const machine = service.machine;

    // Build email data
    const { emailData, highestSeverity, sectionsCount } = buildAlertEmailData(service, machineUrl);

    const selectedUsers =
      selectedUserIds && selectedUserIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: selectedUserIds } },
            select: { id: true, email: true, name: true },
          })
        : [];

    const allEmails: string[] = [...selectedUsers.map((u) => u.email), ...(extraEmails || [])];

    let notificationsCreated = 0;
    try {
      const notification = await prisma.notification.create({
        include: { recipients: { select: { notificationId: true } } },
        data: {
          type: NotificationType.INSPECTION_ALERT,
          metadata: {
            type: NotificationType.INSPECTION_ALERT,
            serviceId: service.id,
            highestSeverity,
            sectionsCount,
            machineId: machine.id,
            machineName: machine.name,
          } as any,
          recipients: { createMany: { data: selectedUsers.map((u) => ({ recipientId: u.id })) } },
        },
      });
      notificationsCreated = notification.recipients.length;
    } catch {
      // swallow DB error and let backend log
    }

    return { machineId: machine.id, allEmails, notificationsCreated, emailData };
  },
};

export default notificationsService;
