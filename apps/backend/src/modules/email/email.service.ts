import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { SendGridProvider } from './providers/sendgrid.provider';
import { TemplateRendererService } from './services/template-renderer.service';
import { appEnv } from '../../config/env';
import type {
  UrgentRequestTemplateData,
  ClientReminderTemplateData,
  AlertNotificationTemplateData,
  PublicServiceRequestTemplateData,
} from './templates/types';
import type { Locale } from './templates/i18n';
import { NotificationType, EmailProvider, EmailStatus } from '@titans-tech/db';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: SendGridProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sendGridProvider: SendGridProvider,
    private readonly templateRenderer: TemplateRendererService,
  ) {
    this.provider = this.sendGridProvider;

    this.logger.log(
      `Email service initialized with provider: ${appEnv.EMAIL_PROVIDER}`,
    );
  }

  /**
   * Get test emails from environment variable
   * Returns an array of trimmed, lowercase email addresses
   */
  private getTestEmails(): string[] {
    if (!appEnv.TEST_EMAILS) return [];
    return appEnv.TEST_EMAILS.split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);
  }

  /**
   * Merge recipients with test emails, ensuring no duplicates
   */
  private mergeWithTestEmails(to: string | string[]): string[] {
    const testEmails = this.getTestEmails();
    const recipients = Array.isArray(to) ? to : [to];
    const allEmails = new Set([
      ...recipients.map((e) => e.toLowerCase()),
      ...testEmails,
    ]);
    return Array.from(allEmails);
  }

  async sendUrgentRequestEmail(
    to: string | string[],
    data: UrgentRequestTemplateData,
    machineId: string,
    locale: Locale = 'en',
  ): Promise<void> {
    const { subject, html, text } =
      await this.templateRenderer.renderUrgentRequest(data, locale);
    const recipients = this.mergeWithTestEmails(to);

    const emailRecord = await this.prisma.email.create({
      data: {
        to: recipients.join(','),
        from: appEnv.EMAIL_FROM,
        subject,
        body: html,
        type: NotificationType.URGENT_SERVICE_REQUEST,
        status: EmailStatus.PENDING,
        provider: EmailProvider.SENDGRID,
        machineId,
      },
    });

    try {
      const result = await this.provider.sendEmail({
        to: recipients,
        subject,
        html,
        text,
      });

      await this.prisma.email.update({
        where: { id: emailRecord.id },
        data: {
          status: result.success ? EmailStatus.SENT : EmailStatus.FAILED,
          externalId: result.messageId,
          error: result.error,
          sentAt: result.success ? new Date() : null,
        },
      });

      if (!result.success) {
        this.logger.error(
          `Failed to send urgent request email: ${result.error}`,
        );
      }
    } catch (error) {
      this.logger.error('Error sending urgent request email', error);
      await this.prisma.email.update({
        where: { id: emailRecord.id },
        data: {
          status: EmailStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async sendClientReminderEmail(
    to: string,
    data: ClientReminderTemplateData,
    machineId: string,
    locale: Locale = 'en',
  ): Promise<void> {
    const { subject, html, text } =
      await this.templateRenderer.renderClientReminder(data, locale);
    const recipients = this.mergeWithTestEmails(to);

    const notificationType =
      data.daysOverdue && data.daysOverdue > 0
        ? NotificationType.SERVICE_OVERDUE
        : NotificationType.SERVICE_REMINDER;

    const emailRecord = await this.prisma.email.create({
      data: {
        to: recipients.join(','),
        from: appEnv.EMAIL_FROM,
        subject,
        body: html,
        type: notificationType,
        status: EmailStatus.PENDING,
        provider: EmailProvider.SENDGRID,
        machineId,
      },
    });

    try {
      const result = await this.provider.sendEmail({
        to: recipients,
        subject,
        html,
        text,
      });

      await this.prisma.email.update({
        where: { id: emailRecord.id },
        data: {
          status: result.success ? EmailStatus.SENT : EmailStatus.FAILED,
          externalId: result.messageId,
          error: result.error,
          sentAt: result.success ? new Date() : null,
        },
      });

      if (!result.success) {
        this.logger.error(
          `Failed to send client reminder email: ${result.error}`,
        );
      }
    } catch (error) {
      this.logger.error('Error sending client reminder email', error);
      await this.prisma.email.update({
        where: { id: emailRecord.id },
        data: {
          status: EmailStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async sendAlertNotificationEmail(
    to: string | string[],
    data: AlertNotificationTemplateData,
    machineId: string,
    locale: Locale = 'en',
  ): Promise<void> {
    const { subject, html, text } =
      await this.templateRenderer.renderAlertNotification(data, locale);
    const recipients = this.mergeWithTestEmails(to);

    const emailRecord = await this.prisma.email.create({
      data: {
        to: recipients.join(','),
        from: appEnv.EMAIL_FROM,
        subject,
        body: html,
        type: NotificationType.INSPECTION_ALERT,
        status: EmailStatus.PENDING,
        provider:
          appEnv.EMAIL_PROVIDER === 'AWS_SES'
            ? EmailProvider.AWS_SES
            : EmailProvider.SENDGRID,
        machineId,
      },
    });

    try {
      const result = await this.provider.sendEmail({
        to: recipients,
        subject,
        html,
        text,
      });

      await this.prisma.email.update({
        where: { id: emailRecord.id },
        data: {
          status: result.success ? EmailStatus.SENT : EmailStatus.FAILED,
          externalId: result.messageId,
          error: result.error,
          sentAt: result.success ? new Date() : null,
        },
      });

      if (!result.success) {
        this.logger.error(
          `Failed to send alert notification email: ${result.error}`,
        );
      }
    } catch (error) {
      this.logger.error('Error sending alert notification email', error);
      await this.prisma.email.update({
        where: { id: emailRecord.id },
        data: {
          status: EmailStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async sendPublicServiceRequestEmail(
    to: string | string[],
    data: PublicServiceRequestTemplateData,
    machineId: string,
    locale: Locale = 'en',
  ): Promise<void> {
    const { subject, html, text } =
      await this.templateRenderer.renderPublicServiceRequest(data, locale);
    const recipients = this.mergeWithTestEmails(to);

    const emailRecord = await this.prisma.email.create({
      data: {
        to: recipients.join(','),
        from: appEnv.EMAIL_FROM,
        subject,
        body: html,
        type: NotificationType.URGENT_SERVICE_REQUEST,
        status: EmailStatus.PENDING,
        provider:
          appEnv.EMAIL_PROVIDER === 'AWS_SES'
            ? EmailProvider.AWS_SES
            : EmailProvider.SENDGRID,
        machineId,
      },
    });

    try {
      const result = await this.provider.sendEmail({
        to: recipients,
        subject,
        html,
        text,
      });

      await this.prisma.email.update({
        where: { id: emailRecord.id },
        data: {
          status: result.success ? EmailStatus.SENT : EmailStatus.FAILED,
          externalId: result.messageId,
          error: result.error,
          sentAt: result.success ? new Date() : null,
        },
      });

      if (!result.success) {
        this.logger.error(
          `Failed to send public service request email: ${result.error}`,
        );
      }
    } catch (error) {
      this.logger.error('Error sending public service request email', error);
      await this.prisma.email.update({
        where: { id: emailRecord.id },
        data: {
          status: EmailStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async retryFailedEmails(limit: number = 10): Promise<number> {
    const failedEmails = await this.prisma.email.findMany({
      where: {
        status: EmailStatus.FAILED,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    let successCount = 0;

    for (const email of failedEmails) {
      try {
        const result = await this.provider.sendEmail({
          to: email.to.split(','),
          subject: email.subject,
          html: email.body,
          text: email.body,
          from: email.from,
        });

        await this.prisma.email.update({
          where: { id: email.id },
          data: {
            status: result.success ? EmailStatus.SENT : EmailStatus.FAILED,
            externalId: result.messageId,
            error: result.error,
            sentAt: result.success ? new Date() : null,
          },
        });

        if (result.success) {
          successCount++;
        }
      } catch (error) {
        this.logger.error(`Failed to retry email ${email.id}`, error);
      }
    }

    this.logger.log(
      `Retried ${failedEmails.length} failed emails. ${successCount} succeeded.`,
    );

    return successCount;
  }
}
