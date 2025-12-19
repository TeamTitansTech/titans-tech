import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { Layout, InfoSection } from './components';
import { getTranslations, type Locale } from '../i18n';
import type { PartsRequestTemplateData } from '../types';

export interface PartsRequestProps {
  data: PartsRequestTemplateData;
  locale?: Locale;
}

export function PartsRequest({ data, locale = 'en' }: PartsRequestProps) {
  const t = getTranslations(locale);

  return (
    <Layout footer={t.emails.common.footer} footerQuestion={t.emails.common.footerQuestion}>
      <Section style={{ paddingBottom: '12px', marginBottom: '12px' }}>
        <Text style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
          {t.emails.partsRequest.title || 'Parts Request'}
        </Text>
      </Section>

      <InfoSection
        items={[
          { label: t.emails.partsRequest.info.machine, value: data.machineName },
          { label: t.emails.partsRequest.info.branch, value: data.branchName },
          { label: t.emails.partsRequest.info.requestedBy, value: data.requestedBy },
        ]}
      />

      <Section style={{ marginTop: '16px' }}>
        <Text>Parts count: {data.totalParts}</Text>
      </Section>
    </Layout>
  );
}
