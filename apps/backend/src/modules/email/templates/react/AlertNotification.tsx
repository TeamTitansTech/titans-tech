import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import { Layout, Badge, InfoSection, Button } from './components';
import { getTranslations, type Locale } from '../i18n';
import type {
  AlertNotificationTemplateData,
  AlertSection,
  AlertSubsection,
  AlertMeasurement,
} from '../types';

export interface AlertNotificationProps {
  data: AlertNotificationTemplateData;
  locale?: Locale;
}

export function AlertNotification({
  data,
  locale = 'en',
}: AlertNotificationProps) {
  const t = getTranslations(locale);
  const severityColor = data.highestSeverity === 'RED' ? '#ef4444' : '#f59e0b';
  const severityLabel =
    data.highestSeverity === 'RED'
      ? t.emails.alertNotification.severity.critical
      : t.emails.alertNotification.severity.warning;

  const getBadgeVariant = (status: 'YELLOW' | 'RED'): 'red' | 'yellow' => {
    return status === 'RED' ? 'red' : 'yellow';
  };

  const getStatusLabel = (status: 'YELLOW' | 'RED'): string => {
    return status === 'RED'
      ? t.emails.alertNotification.severity.criticalLabel
      : t.emails.alertNotification.severity.warningLabel;
  };

  const renderMeasurements = (measurements: AlertMeasurement[]) => {
    return (
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
              {t.emails.alertNotification.table.measurement}
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
              {t.emails.alertNotification.table.differential}
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
              {t.emails.alertNotification.table.status}
            </th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((m, idx) => (
            <tr key={idx}>
              <td
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                {m.name}
              </td>
              <td
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              >
                {m.differential}
              </td>
              <td
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center',
                }}
              >
                <Badge variant={getBadgeVariant(m.status)}>
                  {getStatusLabel(m.status)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderSubsection = (subsection: AlertSubsection, idx: number) => {
    return (
      <div
        key={idx}
        style={{
          marginBottom: '16px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <span style={{ fontWeight: 600, color: '#1f2937' }}>
            {subsection.name}
          </span>
          <Badge variant={getBadgeVariant(subsection.severity)}>
            {getStatusLabel(subsection.severity)}
          </Badge>
        </div>
        {renderMeasurements(subsection.measurements)}
      </div>
    );
  };

  const renderSection = (section: AlertSection, idx: number) => {
    // Handle sections with subsections
    if (section.subsections && section.subsections.length > 0) {
      return (
        <div
          key={idx}
          style={{
            marginBottom: '24px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
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
              {section.sectionName}
            </Text>
            <Badge variant={getBadgeVariant(section.severity)}>
              {getStatusLabel(section.severity)}
            </Badge>
          </div>
          <div style={{ padding: '16px' }}>
            {section.subsections.map((subsection, subIdx) =>
              renderSubsection(subsection, subIdx),
            )}
          </div>
        </div>
      );
    }

    // Handle sections with alerts (legacy format)
    return (
      <div
        key={idx}
        style={{
          marginBottom: '24px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
            {section.sectionName}
          </Text>
          <Badge variant={getBadgeVariant(section.severity)}>
            {getStatusLabel(section.severity)}
          </Badge>
        </div>
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
                {t.emails.alertNotification.table.measurement}
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
                {t.emails.alertNotification.table.value}
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
                {t.emails.alertNotification.table.status}
              </th>
            </tr>
          </thead>
          <tbody>
            {(section.alerts || []).map((alert, alertIdx) => (
              <tr key={alertIdx}>
                <td
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  {alert.fieldLabel}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #e5e7eb',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  {alert.value}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #e5e7eb',
                    textAlign: 'center',
                  }}
                >
                  <Badge
                    variant={getBadgeVariant(alert.status || section.severity)}
                  >
                    {getStatusLabel(alert.status || section.severity)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout
      footer={t.emails.common.footer}
      footerQuestion={t.emails.common.footerQuestion}
    >
      {/* Header */}
      <Section
        style={{
          borderBottom: `3px solid ${severityColor}`,
          paddingBottom: '20px',
          marginBottom: '24px',
        }}
      >
        <Badge
          variant={data.highestSeverity === 'RED' ? 'red' : 'yellow'}
          style={{ marginBottom: '8px' }}
        >
          {severityLabel}
        </Badge>
        <Text
          style={{
            margin: 0,
            color: severityColor,
            fontSize: '24px',
            fontWeight: 600,
          }}
        >
          {data.highestSeverity === 'RED' ? '🔴' : '🟡'}{' '}
          {t.emails.alertNotification.title}
        </Text>
      </Section>

      {/* Intro */}
      <Text>{t.emails.alertNotification.intro}</Text>

      {/* Machine Info */}
      <InfoSection
        items={[
          {
            label: t.emails.alertNotification.info.machine,
            value: data.machineName,
          },
          {
            label: t.emails.alertNotification.info.company,
            value: data.companyName,
          },
          {
            label: t.emails.alertNotification.info.branch,
            value: data.branchName,
          },
          {
            label: t.emails.alertNotification.info.inspectionDate,
            value: data.inspectionDate,
          },
          {
            label: t.emails.alertNotification.info.performedBy,
            value: data.performedBy,
          },
        ]}
      />

      {/* Alert Details */}
      <Section style={{ margin: '24px 0' }}>
        <Text
          style={{
            color: '#1f2937',
            fontSize: '18px',
            marginBottom: '16px',
            fontWeight: 600,
          }}
        >
          {t.emails.alertNotification.alertDetails}
        </Text>
        {data.sections.map((section, idx) => renderSection(section, idx))}
      </Section>

      {/* CTA Button */}
      <Button href={data.machineUrl}>
        {t.emails.alertNotification.viewMachine}
      </Button>

      {/* Click Message */}
      <Text style={{ fontSize: '14px', color: '#6b7280', marginTop: '24px' }}>
        {t.emails.alertNotification.clickMessage}
      </Text>
    </Layout>
  );
}
