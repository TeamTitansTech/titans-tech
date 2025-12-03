import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
} from '@react-email/components';

export interface LayoutProps {
  children: React.ReactNode;
  footer?: string;
  footerQuestion?: string;
}

export function Layout({ children, footer, footerQuestion }: LayoutProps) {
  return (
    <Html>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Notification</title>
      </Head>
      <Body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
          lineHeight: '1.6',
          color: '#333',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Container
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '32px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {children}

          {(footer || footerQuestion) && (
            <Section
              style={{
                marginTop: '32px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              {footer && (
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0 0 4px 0',
                  }}
                >
                  {footer}
                </Text>
              )}
              {footerQuestion && (
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '4px 0 0 0',
                  }}
                >
                  {footerQuestion}
                </Text>
              )}
            </Section>
          )}
        </Container>
      </Body>
    </Html>
  );
}
