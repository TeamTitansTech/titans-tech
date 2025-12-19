import * as React from 'react';
import { Html, Body, Container, Text } from '@react-email/components';

export function Layout({ children, footer, footerQuestion, style }: any) {
  return (
    <Html>
      <Body style={{ backgroundColor: '#f3f4f6', padding: '20px' }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {children}
          <Text style={{ color: '#6b7280', fontSize: '12px', marginTop: '20px' }}>{footer}</Text>
          <Text style={{ color: '#6b7280', fontSize: '12px' }}>{footerQuestion}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default Layout;
