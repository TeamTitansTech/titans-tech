import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { Layout, Badge, InfoSection } from './components';
import { getTranslations, type Locale } from '../i18n';
import type { UrgentRequestTemplateData } from '../types';

export interface UrgentRequestProps {
  data: UrgentRequestTemplateData;
  locale?: Locale;
}

export function UrgentRequest({ data, locale = 'en' }: UrgentRequestProps) {
  const t = getTranslations(locale);

  return (
    <Layout footer={t.emails.common.footer} footerQuestion={t.emails.common.footerQuestion}>
      <Section
        style={{
          borderBottom: '3px solid #ef4444',
          paddingBottom: '20px',
          marginBottom: '24px',
        }}
      >
        <Badge variant="red" style={{ marginBottom: '8px' }}>
          URGENT
        </Badge>
        <Text
          style={{
            margin: 0,
            color: '#ef4444',
            fontSize: '24px',
            fontWeight: 600,
          }}
        >
          🚨 {t.emails.urgentRequest.title}
        </Text>
      </Section>

      <Text>{t.emails.urgentRequest.intro}</Text>

      <InfoSection
        items={[
          {
            label: t.emails.urgentRequest.info.machine,
            value: data.machineName,
          },
          {
            label: t.emails.urgentRequest.info.company,
            value: data.companyName,
          },
          {
            label: t.emails.urgentRequest.info.branch,
            value: data.branchName,
          },
          {
            label: t.emails.urgentRequest.info.requestedBy,
            value: `${data.requestedBy} (${data.requestedByEmail})`,
          },
        ]}
      />

      {data.notes && (
        <Section
          style={{
            backgroundColor: '#fef3c7',
            borderLeft: '4px solid #f59e0b',
            padding: '16px',
            margin: '20px 0',
            borderRadius: '4px',
          }}
        >
          <Text style={{ fontWeight: 600, margin: '0 0 8px 0' }}>
            {t.emails.urgentRequest.notesTitle}:
          </Text>
          <Text style={{ margin: 0, fontStyle: 'italic' }}>
            {data.notes.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < data.notes!.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </Text>
        </Section>
      )}
    </Layout>
  );
}
