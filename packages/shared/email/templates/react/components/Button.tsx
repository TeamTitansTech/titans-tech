import * as React from 'react';
import { Section, Link } from '@react-email/components';

export function Button({ href, children }: any) {
  return (
    <Section style={{ textAlign: 'center', marginTop: '20px' }}>
      <Link
        href={href}
        style={{
          backgroundColor: '#2563eb',
          color: '#fff',
          padding: '12px 18px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        {children}
      </Link>
    </Section>
  );
}

export default Button;
