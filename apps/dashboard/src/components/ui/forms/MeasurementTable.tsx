'use client';

import { cn } from '@/lib/utils';
import { NumericInput } from './NumericInput';

export interface MeasurementRow {
  key: string;
  label: string;
  lhValue: number | string;
  rhValue: number | string;
  differential?: string;
  lhError?: string;
  rhError?: string;
}

export interface MeasurementTableProps {
  rows: MeasurementRow[];
  onLhChange: (key: string, value: number) => void;
  onRhChange: (key: string, value: number) => void;
  onLhBlur?: (key: string) => void;
  onRhBlur?: (key: string) => void;
  lhLabel?: string;
  rhLabel?: string;
  diffLabel?: string;
  measurementLabel?: string;
  className?: string;
  showDifferential?: boolean;
  idPrefix?: string;
}

export function MeasurementTable({
  rows,
  onLhChange,
  onRhChange,
  onLhBlur,
  onRhBlur,
  lhLabel = 'LH',
  rhLabel = 'RH',
  diffLabel = 'Diff.',
  measurementLabel = 'Measurement',
  className,
  showDifferential = true,
  idPrefix = '',
}: MeasurementTableProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Desktop/Tablet Headers */}
      <div
        className={cn(
          'hidden sm:grid gap-4 border-b pb-2',
          showDifferential ? 'sm:grid-cols-4' : 'sm:grid-cols-3',
        )}
      >
        <div className="text-xs font-semibold">{measurementLabel}</div>
        <div className="text-xs font-semibold text-center">{lhLabel}</div>
        <div className="text-xs font-semibold text-center">{rhLabel}</div>
        {showDifferential && <div className="text-xs font-semibold text-center">{diffLabel}</div>}
      </div>

      {rows.map((row) => (
        <div key={row.key}>
          {/* Mobile Layout - Stacked */}
          <div className="sm:hidden space-y-3 border rounded-lg p-3 bg-muted/30">
            <div className="text-xs font-semibold text-foreground/80">{row.label}</div>

            <div className={cn('grid gap-2', showDifferential ? 'grid-cols-3' : 'grid-cols-2')}>
              <NumericInput
                id={`${idPrefix}${row.key}-lh-mobile`}
                label={lhLabel}
                value={row.lhValue}
                onChange={(value) => onLhChange(row.key, value)}
                onBlur={() => onLhBlur?.(row.key)}
                error={row.lhError}
                labelClassName="text-[10px] text-center block"
                inputClassName="h-9"
              />

              <NumericInput
                id={`${idPrefix}${row.key}-rh-mobile`}
                label={rhLabel}
                value={row.rhValue}
                onChange={(value) => onRhChange(row.key, value)}
                onBlur={() => onRhBlur?.(row.key)}
                error={row.rhError}
                labelClassName="text-[10px] text-center block"
                inputClassName="h-9"
              />

              {showDifferential && (
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground block text-center">
                    {diffLabel}
                  </label>
                  <div className="h-9 flex items-center justify-center text-xs font-medium bg-muted rounded-md border">
                    {row.differential || '-'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop/Tablet Layout - Grid */}
          <div
            className={cn(
              'hidden sm:grid gap-4',
              showDifferential ? 'sm:grid-cols-4' : 'sm:grid-cols-3',
            )}
          >
            <div className="text-xs font-medium flex items-center">{row.label}</div>

            <NumericInput
              id={`${idPrefix}${row.key}-lh`}
              value={row.lhValue}
              onChange={(value) => onLhChange(row.key, value)}
              onBlur={() => onLhBlur?.(row.key)}
              error={row.lhError}
              showLabel={false}
              inputClassName="text-center"
            />

            <NumericInput
              id={`${idPrefix}${row.key}-rh`}
              value={row.rhValue}
              onChange={(value) => onRhChange(row.key, value)}
              onBlur={() => onRhBlur?.(row.key)}
              error={row.rhError}
              showLabel={false}
              inputClassName="text-center"
            />

            {showDifferential && (
              <div className="h-9 flex items-center justify-center text-xs font-medium bg-muted rounded-md border">
                {row.differential || '-'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
