import * as React from 'react';
import { Button as EmailButton } from '@react-email/components';

export interface ButtonProps {
  href: string;
  children: React.ReactNode;
  backgroundColor?: string;
}

export function Button({
  href,
  children,
  backgroundColor = '#3b82f6',
}: ButtonProps) {
  return (
    <div style={{ textAlign: 'center', margin: '24px 0' }}>
      <EmailButton
        href={href}
        style={{
          backgroundColor,
          color: 'white',
          padding: '14px 28px',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: 600,
          display: 'inline-block',
        }}
      >
        {children}
      </EmailButton>
    </div>
  );
}
