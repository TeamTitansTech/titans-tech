import * as React from 'react';
import { Section, Text } from '@react-email/components';

export function InfoSection({ items }: any) {
  return (
    <Section style={{ margin: '16px 0' }}>
      {items.map((it: any, idx: number) => (
        <div key={idx} style={{ marginBottom: '8px' }}>
          <Text style={{ margin: 0, fontWeight: 700 }}>{it.label}</Text>
          <Text style={{ margin: 0, color: '#6b7280' }}>{it.value}</Text>
        </div>
      ))}
    </Section>
  );
}

export default InfoSection;
