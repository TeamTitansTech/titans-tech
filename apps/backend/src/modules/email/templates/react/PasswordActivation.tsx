import * as React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { Layout, Badge } from './components';
import { getTranslations, type Locale } from '../i18n';
import type { PasswordActivationTemplateData } from '../types';

export interface PasswordActivationProps {
  data: PasswordActivationTemplateData;
  locale?: Locale;
}

export function PasswordActivation({
  data,
  locale = 'en',
}: PasswordActivationProps) {
  const t = getTranslations(locale);

  return (
    <Layout
      footer={t.emails.common.footer}
      footerQuestion={t.emails.common.footerQuestion}
    >
      <Section style={{ marginBottom: '24px' }}>
        <Badge variant="blue" style={{ marginBottom: '8px' }}>
          {t.emails.passwordActivation.badge}
        </Badge>
        <Text style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          🔑 {t.emails.passwordActivation.title}
        </Text>
      </Section>

      <Text>
        {t.emails.passwordActivation.greeting.replace(
          '{userName}',
          data.userName,
        )}
      </Text>

      <Text>
        {t.emails.passwordActivation.intro.replace(
          '{companyName}',
          data.companyName,
        )}
      </Text>

      <Section style={{ margin: '32px 0', textAlign: 'center' }}>
        <Button
          href={data.activationUrl}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px 32px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '16px',
            display: 'inline-block',
          }}
        >
          {t.emails.passwordActivation.button}
        </Button>
      </Section>

      <Section
        style={{
          backgroundColor: '#f3f4f6',
          borderLeft: '4px solid #3b82f6',
          padding: '16px',
          margin: '20px 0',
          borderRadius: '4px',
        }}
      >
        <Text
          style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}
        >
          ℹ️ {t.emails.passwordActivation.expiryNote}
        </Text>
        <Text style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          🔒 {t.emails.passwordActivation.noRequestNote}
        </Text>
      </Section>
    </Layout>
  );
}
