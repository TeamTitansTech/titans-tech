'use client';

import { Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'ok' | 'warning' | 'alert' | 'unknown';
  label: string;
}

const STATUS_COLORS = {
  ok: 'text-green-500',
  warning: 'text-yellow-500',
  alert: 'text-red-500',
  unknown: 'text-muted-foreground',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <Circle className={`w-2 h-2 fill-current ${STATUS_COLORS[status]}`} />
      <span className="truncate">{label}</span>
    </div>
  );
}
