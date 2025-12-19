import * as React from 'react';
import { Text } from '@react-email/components';

export function Badge({ children, variant = 'yellow', style = {} }: any) {
  const bg = variant === 'red' ? '#fee2e2' : '#fffbeb';
  const color = variant === 'red' ? '#ef4444' : '#f59e0b';
  return (
    <Text
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        backgroundColor: bg,
        color,
        borderRadius: '9999px',
        fontWeight: 700,
        fontSize: '12px',
        ...style,
      }}
    >
      {children}
    </Text>
  );
}

export default Badge;
