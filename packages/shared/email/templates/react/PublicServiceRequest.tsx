import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { Layout, InfoSection } from './components';
import { getTranslations, type Locale } from '../i18n';
import type { PublicServiceRequestTemplateData } from '../types';

export interface PublicServiceRequestProps {
  data: PublicServiceRequestTemplateData;
  locale?: Locale;
}

export function PublicServiceRequest({ data, locale = 'en' }: PublicServiceRequestProps) {
  const t = getTranslations(locale);

  return (
    <Layout footer={t.emails.common.footer} footerQuestion={t.emails.common.footerQuestion}>
      <Section style={{ paddingBottom: '12px', marginBottom: '12px' }}>
        <Text style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
          {t.emails.publicServiceRequest.title || 'Service Request'}
        </Text>
      </Section>

      <InfoSection
        items={[
          { label: t.emails.publicServiceRequest.info.machine, value: data.machineName },
          { label: t.emails.publicServiceRequest.info.company, value: data.companyName },
          { label: t.emails.publicServiceRequest.info.branch, value: data.branchName },
        ]}
      />

      <Section style={{ marginTop: '16px' }}>
        <Text>{data.problemDescription}</Text>
      </Section>
    </Layout>
  );
}
