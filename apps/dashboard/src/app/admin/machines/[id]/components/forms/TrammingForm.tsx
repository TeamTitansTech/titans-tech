'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type TrammingData } from '@/data/types/services.types';

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

  const renderInput = (field: keyof TrammingData) =>
    readOnly ? (
      <div className="w-20 h-8 text-sm px-2 py-1 border rounded-md bg-muted/50 flex items-center justify-center font-medium">
        {data[field]}
      </div>
    ) : (
      <Input
        id={`${field}`}
        type="number"
        step="0.0001"
        min="0"
        max="999999.9999"
        value={data[field]}
        onChange={(e) => updateField(field, Number(e.target.value))}
        onBlur={() => handleBlur(field)}
        className={`w-20 h-8 text-sm px-2 py-1 ${errors[field] ? 'border-destructive' : ''}`}
        required
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

        {/* Left input - with extra spacing from center */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: '-52px' }}>
          {renderInput(point.fields.left)}
        </div>

        {/* Center trim pin circle */}
        <div className="w-8 h-8 rounded-full border-2 border-foreground/30 bg-background flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
        </div>

        {/* Right input - with extra spacing from center */}
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
      <div className="relative ">
        {/* Background slide area */}
        <div className="absolute inset-0 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg" />

        <div className="relative min-h-[350px] flex items-center justify-center p-4">
          {/* Grid layout: 3x3 with center being the trim pin */}
          <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full max-w-3xl">
            {/* Top-Left: Empty */}
            <div />

            {/* Top-Center: Top Measurements */}
            {renderMeasurementPoint(measurementPoints[0])}

            {/* Top-Right: Empty */}
            <div />

            {/* Middle-Left: Left Measurements */}
            {renderMeasurementPoint(measurementPoints[2])}

            {/* Middle-Center: Trim Pin */}
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-foreground/30 bg-background flex items-center justify-center p-1">
                <span className="text-[8px] font-medium text-muted-foreground text-center leading-tight">
                  {t('trimPin')}
                </span>
              </div>
            </div>

            {/* Middle-Right: Right Measurements */}
            {renderMeasurementPoint(measurementPoints[3])}

            {/* Bottom-Left: Empty */}
            <div />

            {/* Bottom-Center: Bottom Measurements */}
            {renderMeasurementPoint(measurementPoints[1])}

            {/* Bottom-Right: Empty */}
            <div />
          </div>
        </div>
      </div>
    </div>
  );
}
