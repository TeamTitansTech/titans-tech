'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface MeasurementGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 6;
  className?: string;
  responsive?: boolean;
}

export function MeasurementGrid({
  children,
  columns = 3,
  className,
  responsive = true,
}: MeasurementGridProps) {
  const gridClasses = responsive
    ? {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
      }
    : {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        6: 'grid-cols-6',
      };

  return <div className={cn('grid gap-4', gridClasses[columns], className)}>{children}</div>;
}
