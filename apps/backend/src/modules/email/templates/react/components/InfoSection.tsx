import * as React from 'react';
import { Section, Text } from '@react-email/components';

export interface InfoItem {
  label: string;
  value: string | number | null | undefined;
}

export interface InfoSectionProps {
  items: InfoItem[];
  borderColor?: string;
  backgroundColor?: string;
}

export function InfoSection({
  items,
  borderColor = '#3b82f6',
  backgroundColor = '#f9fafb',
}: InfoSectionProps) {
  return (
    <Section
      style={{
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        padding: '16px',
        margin: '20px 0',
        borderRadius: '4px',
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            margin: '8px 0',
          }}
        >
          <Text
            style={{
              margin: 0,
              display: 'inline',
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: '#1f2937',
                minWidth: '120px',
                display: 'inline-block',
              }}
            >
              {item.label}:
            </span>
            <span style={{ marginLeft: '8px' }}>
              {item.value !== null && item.value !== undefined
                ? item.value
                : 'N/A'}
            </span>
          </Text>
        </div>
      ))}
    </Section>
  );
}
