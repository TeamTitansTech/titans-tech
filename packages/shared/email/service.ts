import { PrismaClient, EmailStatus, NotificationType, EmailProvider } from '@titans-tech/db';
import { TemplateRenderer } from './template-renderer';
import type {
  UrgentRequestTemplateData,
  ClientReminderTemplateData,
  AlertNotificationTemplateData,
  PublicServiceRequestTemplateData,
  PartsRequestTemplateData,
} from './templates/types';
import type { Locale } from './templates/i18n';

export interface EmailProviderInterface {
  sendEmail(params: {
    to: string[];
    subject: string;
    html: string;
    text: string;
    from?: string;
  }): Promise<{ success: boolean; messageId?: string | null; error?: string | null }>;
}

export interface EmailConfig {
  fromAddress: string;
  testEmails?: string | null;
  provider: 'SENDGRID' | 'AWS_SES';
}

export function mergeWithTestEmails(to: string | string[], testEmails?: string | null) {
  const recipients = Array.isArray(to) ? to : [to];
  const testList = testEmails
    ? testEmails
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    : [];
  const all = new Set<string>([...recipients.map((r) => r.toLowerCase()), ...testList]);
  return Array.from(all);
}

export async function createEmailRecord(
  prisma: PrismaClient,
  args: {
    to: string[];
    from: string;
    subject: string;
    body: string;
    type: NotificationType;
    status: EmailStatus;
    provider: EmailProvider;
    machineId?: string | null;
  },
) {
  const record = await prisma.email.create({
    data: {
      to: args.to.join(','),
      from: args.from,
      subject: args.subject,
      body: args.body,
      type: args.type,
      status: args.status,
      provider: args.provider,
      machineId: args.machineId,
    },
  });
  return record;
}

export async function updateEmailStatus(
  prisma: PrismaClient,
  id: string,
  args: { success: boolean; messageId?: string | null; error?: string | null },
) {
  return prisma.email.update({
    where: { id },
    data: {
      status: args.success ? EmailStatus.SENT : EmailStatus.FAILED,
      externalId: args.messageId || null,
      error: args.error || null,
      sentAt: args.success ? new Date() : null,
    },
  });
}

export async function findFailedEmails(prisma: PrismaClient, limit = 10) {
  return prisma.email.findMany({
    where: { status: EmailStatus.FAILED },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function markEmailFailed(prisma: PrismaClient, id: string, errorMsg: string) {
  return prisma.email.update({
    where: { id },
    data: { status: EmailStatus.FAILED, error: errorMsg },
  });
}

function getEmailProvider(config: EmailConfig): EmailProvider {
  return config.provider === 'AWS_SES' ? EmailProvider.AWS_SES : EmailProvider.SENDGRID;
}

export async function sendUrgentRequestEmail(
  prisma: PrismaClient,
  provider: EmailProviderInterface,
  config: EmailConfig,
  to: string | string[],
  data: UrgentRequestTemplateData,
  machineId: string,
  locale: Locale = 'en',
): Promise<void> {
  const { subject, html, text } = await TemplateRenderer.renderUrgentRequest(data, locale);
  const recipients = mergeWithTestEmails(to, config.testEmails);

  const emailRecord = await createEmailRecord(prisma, {
    to: recipients,
    from: config.fromAddress,
    subject,
    body: html,
    type: NotificationType.URGENT_SERVICE_REQUEST,
    status: EmailStatus.PENDING,
    provider: EmailProvider.SENDGRID,
    machineId,
  });

  try {
    const result = await provider.sendEmail({ to: recipients, subject, html, text });
    await updateEmailStatus(prisma, emailRecord.id, {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });
    if (!result.success) {
      throw new Error(`Failed to send urgent request email: ${result.error}`);
    }
  } catch (error) {
    await markEmailFailed(
      prisma,
      emailRecord.id,
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

export async function sendClientReminderEmail(
  prisma: PrismaClient,
  provider: EmailProviderInterface,
  config: EmailConfig,
  to: string,
  data: ClientReminderTemplateData,
  machineId: string,
  locale: Locale = 'en',
): Promise<void> {
  const { subject, html, text } = await TemplateRenderer.renderClientReminder(data, locale);
  const recipients = mergeWithTestEmails(to, config.testEmails);

  const notificationType =
    data.daysOverdue && data.daysOverdue > 0
      ? NotificationType.SERVICE_OVERDUE
      : NotificationType.SERVICE_REMINDER;

  const emailRecord = await createEmailRecord(prisma, {
    to: recipients,
    from: config.fromAddress,
    subject,
    body: html,
    type: notificationType,
    status: EmailStatus.PENDING,
    provider: EmailProvider.SENDGRID,
    machineId,
  });

  try {
    const result = await provider.sendEmail({ to: recipients, subject, html, text });
    await updateEmailStatus(prisma, emailRecord.id, {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });
    if (!result.success) {
      throw new Error(`Failed to send client reminder email: ${result.error}`);
    }
  } catch (error) {
    await markEmailFailed(
      prisma,
      emailRecord.id,
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

export async function sendAlertNotificationEmail(
  prisma: PrismaClient,
  provider: EmailProviderInterface,
  config: EmailConfig,
  to: string | string[],
  data: AlertNotificationTemplateData,
  machineId: string,
  locale: Locale = 'en',
): Promise<void> {
  const { subject, html, text } = await TemplateRenderer.renderAlertNotification(data, locale);
  const recipients = mergeWithTestEmails(to, config.testEmails);

  const emailRecord = await createEmailRecord(prisma, {
    to: recipients,
    from: config.fromAddress,
    subject,
    body: html,
    type: NotificationType.INSPECTION_ALERT,
    status: EmailStatus.PENDING,
    provider: getEmailProvider(config),
    machineId,
  });

  try {
    const result = await provider.sendEmail({ to: recipients, subject, html, text });
    await updateEmailStatus(prisma, emailRecord.id, {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });
    if (!result.success) {
      throw new Error(`Failed to send alert notification email: ${result.error}`);
    }
  } catch (error) {
    await markEmailFailed(
      prisma,
      emailRecord.id,
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

export async function sendPublicServiceRequestEmail(
  prisma: PrismaClient,
  provider: EmailProviderInterface,
  config: EmailConfig,
  to: string | string[],
  data: PublicServiceRequestTemplateData,
  machineId: string,
  locale: Locale = 'en',
): Promise<void> {
  const { subject, html, text } = await TemplateRenderer.renderPublicServiceRequest(data, locale);
  const recipients = mergeWithTestEmails(to, config.testEmails);

  const emailRecord = await createEmailRecord(prisma, {
    to: recipients,
    from: config.fromAddress,
    subject,
    body: html,
    type: NotificationType.URGENT_SERVICE_REQUEST,
    status: EmailStatus.PENDING,
    provider: getEmailProvider(config),
    machineId,
  });

  try {
    const result = await provider.sendEmail({ to: recipients, subject, html, text });
    await updateEmailStatus(prisma, emailRecord.id, {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });
    if (!result.success) {
      throw new Error(`Failed to send public service request email: ${result.error}`);
    }
  } catch (error) {
    await markEmailFailed(
      prisma,
      emailRecord.id,
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

export async function sendPartsRequestEmail(
  prisma: PrismaClient,
  provider: EmailProviderInterface,
  config: EmailConfig,
  to: string | string[],
  data: PartsRequestTemplateData,
  machineId: string,
  locale: Locale = 'en',
): Promise<void> {
  const { subject, html, text } = await TemplateRenderer.renderPartsRequest(data, locale);
  const recipients = mergeWithTestEmails(to, config.testEmails);

  const emailRecord = await createEmailRecord(prisma, {
    to: recipients,
    from: config.fromAddress,
    subject,
    body: html,
    type: NotificationType.PARTS_REQUEST,
    status: EmailStatus.PENDING,
    provider: getEmailProvider(config),
    machineId,
  });

  try {
    const result = await provider.sendEmail({ to: recipients, subject, html, text });
    await updateEmailStatus(prisma, emailRecord.id, {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });
    if (!result.success) {
      throw new Error(`Failed to send parts request email: ${result.error}`);
    }
  } catch (error) {
    await markEmailFailed(
      prisma,
      emailRecord.id,
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

export async function retryFailedEmails(
  prisma: PrismaClient,
  provider: EmailProviderInterface,
  limit: number = 10,
): Promise<number> {
  const failedEmails = await findFailedEmails(prisma, limit);

  let successCount = 0;

  for (const email of failedEmails) {
    try {
      const result = await provider.sendEmail({
        to: email.to.split(','),
        subject: email.subject,
        html: email.body,
        text: email.body,
        from: email.from,
      });
      await updateEmailStatus(prisma, email.id, {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });
      if (result.success) successCount++;
    } catch (error) {
      await markEmailFailed(
        prisma,
        email.id,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  return successCount;
}

export const emailService = {
  mergeWithTestEmails,
  createEmailRecord,
  updateEmailStatus,
  findFailedEmails,
  markEmailFailed,
  sendUrgentRequestEmail,
  sendClientReminderEmail,
  sendAlertNotificationEmail,
  sendPublicServiceRequestEmail,
  sendPartsRequestEmail,
  retryFailedEmails,
};

export default emailService;
