import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { Layout, InfoSection } from './components';
import { getTranslations, type Locale } from '../i18n';
import type { ClientReminderTemplateData } from '../types';

export interface ClientReminderProps {
  data: ClientReminderTemplateData;
  locale?: Locale;
}

export function ClientReminder({ data, locale = 'en' }: ClientReminderProps) {
  const t = getTranslations(locale);

  return (
    <Layout footer={t.emails.common.footer} footerQuestion={t.emails.common.footerQuestion}>
      <Section style={{ paddingBottom: '12px', marginBottom: '12px' }}>
        <Text style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
          {t.emails.clientReminder.title || 'Service Reminder'}
        </Text>
      </Section>

      <InfoSection
        items={[
          { label: t.emails.clientReminder.info.machine, value: data.machineName },
          { label: t.emails.clientReminder.info.branch, value: data.branchName },
          { label: t.emails.clientReminder.info.lastService, value: data.lastServiceDate || 'N/A' },
        ]}
      />

      <Section style={{ marginTop: '16px' }}>
        <Text>{t.emails.clientReminder.message}</Text>
      </Section>
    </Layout>
  );
}
