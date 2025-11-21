import * as sgMail from '@sendgrid/mail';
import { Injectable, Logger } from '@nestjs/common';
import { appEnv } from '../../../config/env';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class SendGridProvider {
  private readonly logger = new Logger(SendGridProvider.name);
  private readonly isConfigured: boolean;

  constructor() {
    const apiKey = appEnv.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
      this.logger.log('SendGrid provider initialized successfully');
    } else {
      this.isConfigured = false;
      this.logger.warn(
        'SendGrid API key not configured. Emails will be logged but not sent.',
      );
    }
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const { to, subject, html, text, from } = params;

    const msg = {
      to: Array.isArray(to) ? to : [to],
      from: from || appEnv.EMAIL_FROM,
      subject,
      text,
      html,
    };

    if (!this.isConfigured) {
      this.logger.warn('SendGrid not configured. Email would be sent:');
      this.logger.warn(JSON.stringify(msg, null, 2));
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    }

    try {
      const [response] = await sgMail.send(msg);

      this.logger.log(
        `Email sent successfully to ${Array.isArray(to) ? to.join(', ') : to}`,
      );

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
      };
    } catch (error) {
      this.logger.error('Failed to send email via SendGrid', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendBulkEmails(emails: SendEmailParams[]): Promise<SendEmailResult[]> {
    return Promise.all(emails.map((email) => this.sendEmail(email)));
  }
}
