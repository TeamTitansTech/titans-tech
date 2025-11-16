'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FieldGroupProps {
  title?: string;
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  titleClassName?: string;
  gridClassName?: string;
}

export function FieldGroup({
  title,
  children,
  columns = 3,
  className,
  titleClassName,
  gridClassName,
}: FieldGroupProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('space-y-4', className)}>
      {title && <h4 className={cn('font-semibold text-sm', titleClassName)}>{title}</h4>}
      <div className={cn('grid gap-4', gridCols[columns], gridClassName)}>{children}</div>
    </div>
  );
}
