import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { SendGridProvider } from './providers/sendgrid.provider';
import {
  emailService,
  type EmailConfig,
  type EmailProviderInterface,
} from '@titans-tech/shared/email/service';
import { appEnv } from '../../config/env';
import type {
  UrgentRequestTemplateData,
  ClientReminderTemplateData,
  AlertNotificationTemplateData,
  PublicServiceRequestTemplateData,
  PartsRequestTemplateData,
} from '@titans-tech/shared/email/templates/types';
import type { Locale } from '@titans-tech/shared/email/templates/i18n';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: EmailProviderInterface;
  private readonly config: EmailConfig;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sendGridProvider: SendGridProvider,
  ) {
    this.provider = this.sendGridProvider;
    this.config = {
      fromAddress: appEnv.EMAIL_FROM,
      testEmails: appEnv.TEST_EMAILS || null,
      provider: appEnv.EMAIL_PROVIDER === 'AWS_SES' ? 'AWS_SES' : 'SENDGRID',
    };

    this.logger.log(
      `Email service initialized with provider: ${appEnv.EMAIL_PROVIDER}`,
    );
  }

  async sendUrgentRequestEmail(
    to: string | string[],
    data: UrgentRequestTemplateData,
    machineId: string,
    locale: Locale = 'en',
  ): Promise<void> {
    try {
      await emailService.sendUrgentRequestEmail(
        this.prisma,
        this.provider,
        this.config,
        to,
        data,
        machineId,
        locale,
      );
    } catch (error) {
      this.logger.error('Error sending urgent request email', error);
      throw error;
    }
  }

  async sendClientReminderEmail(
    to: string,
    data: ClientReminderTemplateData,
    machineId: string,
    locale: Locale = 'en',
  ): Promise<void> {
    try {
      await emailService.sendClientReminderEmail(
        this.prisma,
        this.provider,
        this.config,
        to,
        data,
        machineId,
        locale,
      );
    } catch (error) {
      this.logger.error('Error sending client reminder email', error);
      throw error;
    }
  }

  async sendAlertNotificationEmail(
    to: string | string[],
    data: AlertNotificationTemplateData,
    machineId: string,
    locale: Locale = 'en',
  ): Promise<void> {
    try {
      await emailService.sendAlertNotificationEmail(
        this.prisma,
        this.provider,
        this.config,
        to,
        data,
        machineId,
        locale,
      );
    } catch (error) {
      this.logger.error('Error sending alert notification email', error);
      throw error;
    }
  }

  async sendPublicServiceRequestEmail(
    to: string | string[],
    data: PublicServiceRequestTemplateData,
    machineId: string,
    locale: Locale = 'en',
  ): Promise<void> {
    try {
      await emailService.sendPublicServiceRequestEmail(
        this.prisma,
        this.provider,
        this.config,
        to,
        data,
        machineId,
        locale,
      );
    } catch (error) {
      this.logger.error('Error sending public service request email', error);
      throw error;
    }
  }

  async sendPartsRequestEmail(
    to: string | string[],
    data: PartsRequestTemplateData,
    machineId: string,
    locale: Locale = 'en',
  ): Promise<void> {
    try {
      await emailService.sendPartsRequestEmail(
        this.prisma,
        this.provider,
        this.config,
        to,
        data,
        machineId,
        locale,
      );
    } catch (error) {
      this.logger.error('Error sending parts request email', error);
      throw error;
    }
  }

  async retryFailedEmails(limit: number = 10): Promise<number> {
    const successCount = await emailService.retryFailedEmails(
      this.prisma,
      this.provider,
      limit,
    );

    this.logger.log(`Retried failed emails. ${successCount} succeeded.`);

    return successCount;
  }
}
