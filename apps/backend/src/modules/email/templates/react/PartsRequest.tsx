import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { Layout, Badge, InfoSection } from './components';
import { getTranslations, type Locale } from '../i18n';
import type { PartsRequestTemplateData, PartsGroup } from '../types';

export interface PartsRequestProps {
  data: PartsRequestTemplateData;
  locale?: Locale;
}

function PartsTable({ group }: { group: PartsGroup }) {
  return (
    <div
      style={{
        marginBottom: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {/* Group Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        <Text
          style={{
            margin: 0,
            color: '#1f2937',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          {group.subsectionName}
        </Text>
        <Text
          style={{
            margin: '4px 0 0 0',
            fontSize: '13px',
            color: '#6b7280',
          }}
        >
          {group.parts.length} part(s)
        </Text>
      </div>

      {/* Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: 500,
                color: '#6b7280',
                fontSize: '13px',
              }}
            >
              Part Number
            </th>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: 500,
                color: '#6b7280',
                fontSize: '13px',
              }}
            >
              Description
            </th>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'right',
                fontWeight: 500,
                color: '#6b7280',
                fontSize: '13px',
              }}
            >
              Qty
            </th>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'center',
                fontWeight: 500,
                color: '#6b7280',
                fontSize: '13px',
              }}
            >
              Unit
            </th>
          </tr>
        </thead>
        <tbody>
          {group.parts.map((part, idx) => (
            <tr key={idx}>
              <td
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #e5e7eb',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                }}
              >
                {part.partNumber}
              </td>
              <td
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                {part.description}
              </td>
              <td
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'right',
                  fontWeight: 600,
                }}
              >
                {part.quantity}
              </td>
              <td
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center',
                }}
              >
                {part.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PartsRequest({ data, locale = 'en' }: PartsRequestProps) {
  const t = getTranslations(locale);

  const infoItems = [
    {
      label: t.emails.partsRequest.info.machine,
      value: data.machineName,
    },
    {
      label: t.emails.partsRequest.info.serialNumber,
      value: data.machineSerial,
    },
    {
      label: t.emails.partsRequest.info.section,
      value: data.sectionName,
    },
    {
      label: t.emails.partsRequest.info.company,
      value: data.companyName,
    },
    {
      label: t.emails.partsRequest.info.branch,
      value: data.branchName,
    },
    {
      label: t.emails.partsRequest.info.requestedBy,
      value: data.requestedBy,
    },
    {
      label: t.emails.partsRequest.info.requestDate,
      value: data.requestDate,
    },
    {
      label: t.emails.partsRequest.info.totalParts,
      value: data.totalParts,
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
          borderBottom: '3px solid #3b82f6',
          paddingBottom: '20px',
          marginBottom: '24px',
        }}
      >
        <Badge variant="blue" style={{ marginBottom: '8px' }}>
          {t.emails.partsRequest.badge}
        </Badge>
        <Text
          style={{
            margin: 0,
            color: '#1f2937',
            fontSize: '24px',
            fontWeight: 600,
          }}
        >
          {t.emails.partsRequest.title}
        </Text>
      </Section>

      {/* Intro */}
      <Text>{t.emails.partsRequest.intro}</Text>

      {/* Machine Information */}
      <InfoSection
        title={t.emails.partsRequest.machineInfo}
        items={infoItems}
        borderColor="#3b82f6"
      />

      {/* Parts Section */}
      <Section style={{ margin: '24px 0' }}>
        <Text
          style={{
            color: '#1f2937',
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '16px',
          }}
        >
          {t.emails.partsRequest.requestedParts}
        </Text>
        {data.partsGroups.map((group, idx) => (
          <React.Fragment key={idx}>
            <PartsTable group={group} />
          </React.Fragment>
        ))}
      </Section>

      {/* Note */}
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
          <strong>Note:</strong> {t.emails.partsRequest.note}
        </Text>
      </Section>
    </Layout>
  );
}
