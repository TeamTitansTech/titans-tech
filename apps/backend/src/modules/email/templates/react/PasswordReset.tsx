import * as React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { Layout, Badge } from './components';
import { getTranslations, type Locale } from '../i18n';
import type { PasswordResetTemplateData } from '../types';

export interface PasswordResetProps {
  data: PasswordResetTemplateData;
  locale?: Locale;
}

export function PasswordReset({ data, locale = 'en' }: PasswordResetProps) {
  const t = getTranslations(locale);

  return (
    <Layout
      footer={t.emails.common.footer}
      footerQuestion={t.emails.common.footerQuestion}
    >
      <Section style={{ marginBottom: '24px' }}>
        <Badge variant="yellow" style={{ marginBottom: '8px' }}>
          {t.emails.passwordReset.badge}
        </Badge>
        <Text style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          🔒 {t.emails.passwordReset.title}
        </Text>
      </Section>

      <Text>
        {t.emails.passwordReset.greeting.replace('{userName}', data.userName)}
      </Text>

      <Text>{t.emails.passwordReset.intro}</Text>

      <Section style={{ margin: '32px 0', textAlign: 'center' }}>
        <Button
          href={data.resetUrl}
          style={{
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            padding: '12px 32px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '16px',
            display: 'inline-block',
          }}
        >
          {t.emails.passwordReset.button}
        </Button>
      </Section>

      <Section
        style={{
          backgroundColor: '#fef3c7',
          borderLeft: '4px solid #f59e0b',
          padding: '16px',
          margin: '20px 0',
          borderRadius: '4px',
        }}
      >
        <Text
          style={{ fontSize: '14px', color: '#92400e', margin: '0 0 8px 0' }}
        >
          ⏰ {t.emails.passwordReset.expiryNote}
        </Text>
        <Text style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
          🔒 {t.emails.passwordReset.noRequestNote}
        </Text>
      </Section>
    </Layout>
  );
}
