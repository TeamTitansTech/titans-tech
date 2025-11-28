import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { SendGridProvider } from './providers/sendgrid.provider';
import { appEnv } from '../../config/env';
import {
  getUrgentRequestHtml,
  getUrgentRequestSubject,
  getUrgentRequestText,
  type UrgentRequestTemplateData,
} from './templates/urgent-request.template';
import {
  getClientReminderHtml,
  getClientReminderSubject,
  getClientReminderText,
  type ClientReminderTemplateData,
} from './templates/client-reminder.template';
import {
  getAlertNotificationHtml,
  getAlertNotificationSubject,
  getAlertNotificationText,
  type AlertNotificationTemplateData,
} from './templates/alert-notification.template';
import { NotificationType, EmailProvider, EmailStatus } from '@titans-tech/db';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: SendGridProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sendGridProvider: SendGridProvider,
  ) {
    this.provider = this.sendGridProvider;

    this.logger.log(
      `Email service initialized with provider: ${appEnv.EMAIL_PROVIDER}`,
    );
  }

  async sendUrgentRequestEmail(
    to: string | string[],
    data: UrgentRequestTemplateData,
    machineId: string,
  ): Promise<void> {
    const subject = getUrgentRequestSubject(data);
    const html = getUrgentRequestHtml(data);
    const text = getUrgentRequestText(data);

    const emailRecord = await this.prisma.email.create({
      data: {
        to: Array.isArray(to) ? to.join(',') : to,
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
        to,
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
  ): Promise<void> {
    const subject = getClientReminderSubject(data);
    const html = getClientReminderHtml(data);
    const text = getClientReminderText(data);

    const notificationType =
      data.daysOverdue && data.daysOverdue > 0
        ? NotificationType.SERVICE_OVERDUE
        : NotificationType.SERVICE_REMINDER;

    const emailRecord = await this.prisma.email.create({
      data: {
        to,
        from: appEnv.EMAIL_FROM,
        subject,
        body: html,
        type: notificationType,
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
        to,
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
  ): Promise<void> {
    const subject = getAlertNotificationSubject(data);
    const html = getAlertNotificationHtml(data);
    const text = getAlertNotificationText(data);

    const emailRecord = await this.prisma.email.create({
      data: {
        to: Array.isArray(to) ? to.join(',') : to,
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
        to,
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
