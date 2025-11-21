'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { type TrammingData } from '@/data/types/services.types';
import { MeasurementInput } from '../shared/MeasurementInput';

interface TrammingFormProps {
  data: TrammingData;
  errors: Record<string, string>;
  updateField: (field: keyof TrammingData, value: number) => void;
  handleBlur: (field: keyof TrammingData) => void;
  title: string;
  readOnly?: boolean;
}

interface MeasurementPoint {
  label: string;
  fields: {
    top: keyof TrammingData;
    bottom: keyof TrammingData;
    left: keyof TrammingData;
    right: keyof TrammingData;
  };
}

export function TrammingForm({
  data,
  errors,
  updateField,
  handleBlur,
  title,
  readOnly = false,
}: TrammingFormProps) {
  const t = useTranslations('inspections.form.tramming');

  // Determine which fields to use based on the title (Outer vs Inner)
  const isOuter = title === 'Outer';

  const measurementPoints: MeasurementPoint[] = isOuter
    ? [
        {
          label: t('top'),
          fields: {
            top: 'outerTopTop',
            bottom: 'outerTopBottom',
            left: 'outerTopLeft',
            right: 'outerTopRight',
          },
        },
        {
          label: t('bottom'),
          fields: {
            top: 'outerBottomTop',
            bottom: 'outerBottomBottom',
            left: 'outerBottomLeft',
            right: 'outerBottomRight',
          },
        },
        {
          label: t('left'),
          fields: {
            top: 'outerLeftTop',
            bottom: 'outerLeftBottom',
            left: 'outerLeftLeft',
            right: 'outerLeftRight',
          },
        },
        {
          label: t('right'),
          fields: {
            top: 'outerRightTop',
            bottom: 'outerRightBottom',
            left: 'outerRightLeft',
            right: 'outerRightRight',
          },
        },
      ]
    : [
        {
          label: t('top'),
          fields: {
            top: 'innerTopTop',
            bottom: 'innerTopBottom',
            left: 'innerTopLeft',
            right: 'innerTopRight',
          },
        },
        {
          label: t('bottom'),
          fields: {
            top: 'innerBottomTop',
            bottom: 'innerBottomBottom',
            left: 'innerBottomLeft',
            right: 'innerBottomRight',
          },
        },
        {
          label: t('left'),
          fields: {
            top: 'innerLeftTop',
            bottom: 'innerLeftBottom',
            left: 'innerLeftLeft',
            right: 'innerLeftRight',
          },
        },
        {
          label: t('right'),
          fields: {
            top: 'innerRightTop',
            bottom: 'innerRightBottom',
            left: 'innerRightLeft',
            right: 'innerRightRight',
          },
        },
      ];

  const renderInput = (field: keyof TrammingData) => (
    <MeasurementInput
      field={field}
      value={data[field]}
      onChange={updateField}
      onBlur={handleBlur}
      error={errors[field]}
      readOnly={readOnly}
    />
  );

  const renderMeasurementPoint = (point: MeasurementPoint) => (
    <div className="flex flex-col items-center gap-1">
      <Label className="text-xs font-semibold mb-1">{point.label}</Label>
      <div className="relative flex items-center justify-center p-10">
        {/* Top input */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-8px' }}>
          {renderInput(point.fields.top)}
        </div>

        {/* Left input */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: '-52px' }}>
          {renderInput(point.fields.left)}
        </div>

        {/* Center trim pin circle */}
        <div className="w-8 h-8 rounded-full border-2 border-foreground/30 bg-background flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
        </div>

        {/* Right input */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ right: '-52px' }}>
          {renderInput(point.fields.right)}
        </div>

        {/* Bottom input */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-8px' }}>
          {renderInput(point.fields.bottom)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
        {/* Grid layout: 1 measurement point per row on mobile, 2 side by side on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
          {measurementPoints.map((point) => (
            <div key={point.fields.top}>{renderMeasurementPoint(point)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
