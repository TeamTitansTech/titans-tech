import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { Layout, Badge, InfoSection } from './components';
import { getTranslations, type Locale } from '../i18n';
import type { ClientReminderTemplateData } from '../types';

export interface ClientReminderProps {
  data: ClientReminderTemplateData;
  locale?: Locale;
}

export function ClientReminder({ data, locale = 'en' }: ClientReminderProps) {
  const t = getTranslations(locale);
  const isOverdue = data.daysOverdue && data.daysOverdue > 0;
  const badgeColor = isOverdue ? '#ef4444' : '#f59e0b';
  const badgeVariant = isOverdue ? 'red' : 'amber';
  const badgeText = isOverdue ? 'OVERDUE' : 'REMINDER';

  const title = isOverdue
    ? t.emails.clientReminder.titleOverdue
    : t.emails.clientReminder.titleReminder;

  const greeting = isOverdue
    ? t.emails.clientReminder.greetingOverdue.replace(
        '{userName}',
        data.userName,
      )
    : t.emails.clientReminder.greetingReminder.replace(
        '{userName}',
        data.userName,
      );

  const intro = isOverdue
    ? t.emails.clientReminder.introOverdue
    : t.emails.clientReminder.introReminder;

  const infoItems: Array<{
    label: string;
    value: string | number | null | undefined;
  }> = [
    {
      label: t.emails.clientReminder.info.machine,
      value: data.machineName,
    },
    {
      label: t.emails.clientReminder.info.branch,
      value: data.branchName,
    },
  ];

  if (data.lastServiceDate) {
    infoItems.push({
      label: t.emails.clientReminder.info.lastService,
      value: data.lastServiceDate,
    });
  }

  return (
    <Layout
      footer={t.emails.common.footer}
      footerQuestion={t.emails.common.footerQuestion}
    >
      {/* Header */}
      <Section
        style={{
          borderBottom: `3px solid ${badgeColor}`,
          paddingBottom: '20px',
          marginBottom: '24px',
        }}
      >
        <Badge variant={badgeVariant} style={{ marginBottom: '8px' }}>
          {badgeText}
        </Badge>
        <Text
          style={{
            margin: 0,
            color: '#1f2937',
            fontSize: '24px',
            fontWeight: 600,
          }}
        >
          {isOverdue ? '⚠️' : '🔔'} {title}
        </Text>
      </Section>

      {/* Greeting */}
      <Text>{greeting}</Text>

      {/* Intro */}
      <Text>{intro}</Text>

      {/* Machine Info */}
      <InfoSection items={infoItems} />

      {/* Warning for overdue */}
      {isOverdue && (
        <Section
          style={{
            backgroundColor: '#fee2e2',
            borderLeft: '4px solid #ef4444',
            padding: '16px',
            margin: '20px 0',
            borderRadius: '4px',
            color: '#991b1b',
          }}
        >
          <Text style={{ margin: 0, fontWeight: 600 }}>
            ⚠️ {t.emails.clientReminder.warningTitle}
          </Text>
          <Text style={{ margin: '8px 0 0 0' }}>
            {t.emails.clientReminder.warningMessage.replace(
              '{daysOverdue}',
              String(data.daysOverdue),
            )}
          </Text>
        </Section>
      )}
    </Layout>
  );
}
