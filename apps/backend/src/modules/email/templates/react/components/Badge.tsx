import * as React from 'react';

export interface BadgeProps {
  variant: 'red' | 'yellow' | 'amber' | 'orange';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const variantColors: Record<BadgeProps['variant'], string> = {
  red: '#ef4444',
  yellow: '#f59e0b',
  amber: '#f59e0b',
  orange: '#f97316',
};

export function Badge({ variant, children, style }: BadgeProps) {
  const backgroundColor = variantColors[variant];

  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor,
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
