'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { MeasurementInput } from '../shared/MeasurementInput';

// Database format for tramming data (matches Prisma TrammingData model)
export interface TrammingDbData {
  topTop?: number;
  topBottom?: number;
  topLeft?: number;
  topRight?: number;
  bottomTop?: number;
  bottomBottom?: number;
  bottomLeft?: number;
  bottomRight?: number;
  leftTop?: number;
  leftBottom?: number;
  leftLeft?: number;
  leftRight?: number;
  rightTop?: number;
  rightBottom?: number;
  rightLeft?: number;
  rightRight?: number;
}

interface TrammingFormProps {
  data: TrammingDbData;
  errors: Record<string, string>;
  updateField: (field: keyof TrammingDbData, value: number | undefined) => void;
  handleBlur: (field: keyof TrammingDbData) => void;
  readOnly?: boolean;
}

interface MeasurementPoint {
  label: string;
  fields: {
    top: keyof TrammingDbData;
    bottom: keyof TrammingDbData;
    left: keyof TrammingDbData;
    right: keyof TrammingDbData;
  };
}

export function TrammingForm({
  data,
  errors,
  updateField,
  handleBlur,
  readOnly = false,
}: TrammingFormProps) {
  const t = useTranslations('inspections.form.tramming');

  // Same field names for both outer and inner - the title prop indicates context
  const measurementPoints: MeasurementPoint[] = [
    {
      label: t('top'),
      fields: {
        top: 'topTop',
        bottom: 'topBottom',
        left: 'topLeft',
        right: 'topRight',
      },
    },
    {
      label: t('bottom'),
      fields: {
        top: 'bottomTop',
        bottom: 'bottomBottom',
        left: 'bottomLeft',
        right: 'bottomRight',
      },
    },
    {
      label: t('left'),
      fields: {
        top: 'leftTop',
        bottom: 'leftBottom',
        left: 'leftLeft',
        right: 'leftRight',
      },
    },
    {
      label: t('right'),
      fields: {
        top: 'rightTop',
        bottom: 'rightBottom',
        left: 'rightLeft',
        right: 'rightRight',
      },
    },
  ];

  const renderInput = (field: keyof TrammingDbData) => (
    <MeasurementInput
      field={field}
      value={data[field]}
      onChange={updateField}
      onBlur={handleBlur}
      error={errors[field]}
      readOnly={readOnly}
      required={true}
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
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: '-82px' }}>
          {renderInput(point.fields.left)}
        </div>

        {/* Center trim pin circle */}
        <div className="w-10 h-10 rounded-full border-2 border-foreground/30 bg-background flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
        </div>

        {/* Right input */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ right: '-82px' }}>
          {renderInput(point.fields.right)}
        </div>

        {/* Bottom input */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-8px' }}>
          {renderInput(point.fields.bottom)}
        </div>

        {/* Grid lines - horizontal and vertical through center */}
        {/* Horizontal line */}
        <div className="absolute top-1/2 -translate-y-1/2 left-16 right-16 h-[1px] bg-border/30" />
        {/* Vertical line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-16 bottom-16 w-[1px] bg-border/30" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-6">
        {/* Grid layout: Top full width, Left/Right side by side, Bottom full width */}
        <div className="w-full max-w-4xl mx-auto">
          {/* Top - full width */}
          <div className="flex justify-center sm:mb-8">
            {renderMeasurementPoint(measurementPoints[0])}
          </div>

          {/* Left and Right - side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:mb-8">
            {renderMeasurementPoint(measurementPoints[2])}
            {renderMeasurementPoint(measurementPoints[3])}
          </div>

          {/* Bottom - full width */}
          <div className="flex justify-center">{renderMeasurementPoint(measurementPoints[1])}</div>
        </div>
      </div>
    </div>
  );
}
