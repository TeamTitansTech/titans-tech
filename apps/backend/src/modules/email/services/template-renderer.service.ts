import { Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import * as React from 'react';
import {
  AlertNotification,
  UrgentRequest,
  ClientReminder,
  PublicServiceRequest,
  PartsRequest,
} from '../templates/react';
import { getEmailSubject, type Locale } from '../templates/i18n';
import type {
  AlertNotificationTemplateData,
  UrgentRequestTemplateData,
  ClientReminderTemplateData,
  PublicServiceRequestTemplateData,
  PartsRequestTemplateData,
} from '../templates/types';

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class TemplateRendererService {
  /**
   * Render AlertNotification template
   */
  async renderAlertNotification(
    data: AlertNotificationTemplateData,
    locale: Locale = 'en',
  ): Promise<RenderedEmail> {
    const component = React.createElement(AlertNotification, { data, locale });

    const html = await render(component, { pretty: false });
    const text = await render(component, { plainText: true });

    const emoji = data.highestSeverity === 'RED' ? '🔴' : '🟡';
    const level = data.highestSeverity === 'RED' ? 'Critical' : 'Warning';

    const subject = getEmailSubject('alertNotification', locale, {
      emoji,
      level,
      machineName: data.machineName,
    });

    return { subject, html, text };
  }

  /**
   * Render UrgentRequest template
   */
  async renderUrgentRequest(
    data: UrgentRequestTemplateData,
    locale: Locale = 'en',
  ): Promise<RenderedEmail> {
    const component = React.createElement(UrgentRequest, { data, locale });

    const html = await render(component, { pretty: false });
    const text = await render(component, { plainText: true });

    const subject = getEmailSubject('urgentRequest', locale, {
      machineName: data.machineName,
    });

    return { subject, html, text };
  }

  /**
   * Render ClientReminder template
   */
  async renderClientReminder(
    data: ClientReminderTemplateData,
    locale: Locale = 'en',
  ): Promise<RenderedEmail> {
    const component = React.createElement(ClientReminder, { data, locale });

    const html = await render(component, { pretty: false });
    const text = await render(component, { plainText: true });

    const isOverdue = data.daysOverdue && data.daysOverdue > 0;
    const subjectKey = isOverdue
      ? 'clientReminder.subjectOverdue'
      : 'clientReminder.subjectReminder';

    const subject = getEmailSubject(subjectKey, locale, {
      machineName: data.machineName,
    });

    return { subject, html, text };
  }

  /**
   * Render PublicServiceRequest template
   */
  async renderPublicServiceRequest(
    data: PublicServiceRequestTemplateData,
    locale: Locale = 'en',
  ): Promise<RenderedEmail> {
    const component = React.createElement(PublicServiceRequest, {
      data,
      locale,
    });

    const html = await render(component, { pretty: false });
    const text = await render(component, { plainText: true });

    const subject = getEmailSubject('publicServiceRequest', locale, {
      machineName: data.machineName,
    });

    return { subject, html, text };
  }

  /**
   * Render PartsRequest template
   */
  async renderPartsRequest(
    data: PartsRequestTemplateData,
    locale: Locale = 'en',
  ): Promise<RenderedEmail> {
    const component = React.createElement(PartsRequest, {
      data,
      locale,
    });

    const html = await render(component, { pretty: false });
    const text = await render(component, { plainText: true });

    const subject = getEmailSubject('partsRequest', locale, {
      machineName: data.machineName,
      machineSerial: data.machineSerial,
    });

    return { subject, html, text };
  }
}
