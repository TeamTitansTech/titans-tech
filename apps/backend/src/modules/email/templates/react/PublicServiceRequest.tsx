import * as React from 'react';
import { Section, Text, Img } from '@react-email/components';
import { Layout, Badge, InfoSection, Button } from './components';
import { getTranslations, type Locale } from '../i18n';
import type { PublicServiceRequestTemplateData } from '../types';

export interface PublicServiceRequestProps {
  data: PublicServiceRequestTemplateData;
  locale?: Locale;
}

export function PublicServiceRequest({
  data,
  locale = 'en',
}: PublicServiceRequestProps) {
  const t = getTranslations(locale);

  const machineInfoItems: Array<{
    label: string;
    value: string | number | null | undefined;
  }> = [
    {
      label: t.emails.publicServiceRequest.info.machine,
      value: data.machineName,
    },
  ];

  if (data.machineSerialNumber) {
    machineInfoItems.push({
      label: t.emails.publicServiceRequest.info.serialNumber,
      value: data.machineSerialNumber,
    });
  }

  machineInfoItems.push(
    {
      label: t.emails.publicServiceRequest.info.company,
      value: data.companyName,
    },
    {
      label: t.emails.publicServiceRequest.info.branch,
      value: data.branchName,
    },
  );

  const requesterInfoItems: Array<{
    label: string;
    value: string | number | null | undefined;
  }> = [
    {
      label: t.emails.publicServiceRequest.info.name,
      value: data.requesterName,
    },
    {
      label: t.emails.publicServiceRequest.info.email,
      value: data.requesterEmail,
    },
  ];

  if (data.requesterPhone) {
    requesterInfoItems.push({
      label: t.emails.publicServiceRequest.info.phone,
      value: data.requesterPhone,
    });
  }

  const deviceInfoItems = [
    {
      label: t.emails.publicServiceRequest.info.ipAddress,
      value: data.deviceInfo.ipAddress,
    },
    {
      label: t.emails.publicServiceRequest.info.browser,
      value: data.deviceInfo.browser,
    },
    {
      label: t.emails.publicServiceRequest.info.os,
      value: data.deviceInfo.os,
    },
    {
      label: t.emails.publicServiceRequest.info.device,
      value: `${data.deviceInfo.device} ${data.deviceInfo.isMobile ? `(${t.emails.publicServiceRequest.info.mobile})` : '(Desktop)'}`,
    },
  ];

  return (
    <Layout
      footer={t.emails.common.footer}
      footerQuestion={t.emails.common.footerQuestion}
    >
      {/* Header */}
      <Section
        style={{
          borderBottom: '3px solid #f97316',
          paddingBottom: '20px',
          marginBottom: '24px',
        }}
      >
        <Badge variant="orange" style={{ marginBottom: '8px' }}>
          QR CODE REQUEST
        </Badge>
        <Text
          style={{
            margin: 0,
            color: '#f97316',
            fontSize: '24px',
            fontWeight: 600,
          }}
        >
          🔧 {t.emails.publicServiceRequest.title}
        </Text>
      </Section>

      {/* Intro */}
      <Text>{t.emails.publicServiceRequest.intro}</Text>

      {/* Machine Information */}
      <Section
        style={{
          backgroundColor: '#f9fafb',
          borderLeft: '4px solid #3b82f6',
          padding: '16px',
          margin: '20px 0',
          borderRadius: '4px',
        }}
      >
        <Text
          style={{
            margin: '0 0 12px 0',
            color: '#1e40af',
            fontWeight: 600,
          }}
        >
          {t.emails.publicServiceRequest.machineInfo}
        </Text>
        {machineInfoItems.map((item, idx) => (
          <div key={idx} style={{ margin: '8px 0' }}>
            <span
              style={{
                fontWeight: 600,
                color: '#1f2937',
                display: 'inline-block',
                minWidth: '120px',
              }}
            >
              {item.label}:
            </span>
            <span style={{ marginLeft: '8px' }}>{item.value}</span>
          </div>
        ))}
      </Section>

      {/* Requester Information */}
      <Section
        style={{
          backgroundColor: '#f9fafb',
          borderLeft: '4px solid #10b981',
          padding: '16px',
          margin: '20px 0',
          borderRadius: '4px',
        }}
      >
        <Text
          style={{
            margin: '0 0 12px 0',
            color: '#065f46',
            fontWeight: 600,
          }}
        >
          {t.emails.publicServiceRequest.requesterInfo}
        </Text>
        {requesterInfoItems.map((item, idx) => (
          <div key={idx} style={{ margin: '8px 0' }}>
            <span
              style={{
                fontWeight: 600,
                color: '#1f2937',
                display: 'inline-block',
                minWidth: '120px',
              }}
            >
              {item.label}:
            </span>
            <span style={{ marginLeft: '8px' }}>{item.value}</span>
          </div>
        ))}
      </Section>

      {/* Problem Description */}
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
          style={{
            margin: '0 0 12px 0',
            color: '#92400e',
            fontWeight: 600,
          }}
        >
          {t.emails.publicServiceRequest.problemDescription}:
        </Text>
        <Text style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {data.problemDescription}
        </Text>
      </Section>

      {/* Attached Photo */}
      {data.imageUrl && (
        <Section
          style={{
            backgroundColor: '#f9fafb',
            borderLeft: '4px solid #8b5cf6',
            padding: '16px',
            margin: '20px 0',
            borderRadius: '4px',
          }}
        >
          <Text
            style={{
              margin: '0 0 12px 0',
              color: '#6d28d9',
              fontWeight: 600,
            }}
          >
            {t.emails.publicServiceRequest.attachedPhoto}
          </Text>
          <div style={{ textAlign: 'center' }}>
            <Img
              src={data.imageUrl}
              alt="Problem photo"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            />
          </div>
        </Section>
      )}

      {/* CTA Button */}
      <Button href={data.machineUrl}>
        {t.emails.publicServiceRequest.viewMachine}
      </Button>

      {/* Device Information */}
      <Section
        style={{
          backgroundColor: '#f3f4f6',
          borderLeft: '4px solid #6b7280',
          padding: '16px',
          margin: '20px 0',
          borderRadius: '4px',
        }}
      >
        <Text
          style={{
            margin: '0 0 12px 0',
            color: '#374151',
            fontWeight: 600,
          }}
        >
          {t.emails.publicServiceRequest.deviceInfo}
        </Text>
        {deviceInfoItems.map((item, idx) => (
          <div key={idx} style={{ margin: '8px 0' }}>
            <span
              style={{
                fontWeight: 600,
                color: '#1f2937',
                display: 'inline-block',
                minWidth: '120px',
              }}
            >
              {item.label}:
            </span>
            <span style={{ marginLeft: '8px' }}>{item.value}</span>
          </div>
        ))}
      </Section>

      {/* QR Code Note */}
      <Section
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '13px',
          color: '#1e40af',
          marginTop: '16px',
        }}
      >
        <Text style={{ margin: 0 }}>
          <strong>Note:</strong> This request was submitted by an
          unauthenticated user who scanned the machine's QR code.
        </Text>
      </Section>

      {/* Click Message */}
      <Text style={{ fontSize: '14px', color: '#6b7280', marginTop: '24px' }}>
        {t.emails.publicServiceRequest.clickMessage}
      </Text>
    </Layout>
  );
}
