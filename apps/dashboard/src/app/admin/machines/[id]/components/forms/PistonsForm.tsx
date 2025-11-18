'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { type PistonsData } from '@/data/types/services.types';
import { MeasurementInput } from '../shared/MeasurementInput';

interface PistonsFormProps {
  data: PistonsData;
  errors: Record<string, string>;
  updateField: (field: keyof PistonsData, value: number) => void;
  handleBlur: (field: keyof PistonsData) => void;
  title: string;
  readOnly?: boolean;
}

interface PistonPoint {
  label: string;
  fields: {
    frontTop: keyof PistonsData;
    frontBottom: keyof PistonsData;
    left: keyof PistonsData;
    right: keyof PistonsData;
  };
}

export function PistonsForm({
  data,
  errors,
  updateField,
  handleBlur,
  title,
  readOnly = false,
}: PistonsFormProps) {
  const t = useTranslations('inspections.form.pistons');

  // Determine which fields to use based on the title (Outer vs Inner)
  const isOuter = title === 'Outer';

  const pistonPoints: PistonPoint[] = isOuter
    ? [
        {
          label: 'LH',
          fields: {
            frontTop: 'outerLhFrontTop',
            frontBottom: 'outerLhFrontBottom',
            left: 'outerLhLeft',
            right: 'outerLhRight',
          },
        },
        {
          label: 'RH',
          fields: {
            frontTop: 'outerRhFrontTop',
            frontBottom: 'outerRhFrontBottom',
            left: 'outerRhLeft',
            right: 'outerRhRight',
          },
        },
      ]
    : [
        {
          label: 'LH',
          fields: {
            frontTop: 'innerLhFrontTop',
            frontBottom: 'innerLhFrontBottom',
            left: 'innerLhLeft',
            right: 'innerLhRight',
          },
        },
        {
          label: 'RH',
          fields: {
            frontTop: 'innerRhFrontTop',
            frontBottom: 'innerRhFrontBottom',
            left: 'innerRhLeft',
            right: 'innerRhRight',
          },
        },
      ];

  const renderInput = (field: keyof PistonsData) => (
    <MeasurementInput
      field={field}
      value={data[field]}
      onChange={updateField}
      onBlur={handleBlur}
      error={errors[field]}
      readOnly={readOnly}
    />
  );

  const renderPiston = (piston: PistonPoint) => (
    <div className="flex flex-col items-center gap-1">
      <Label className="text-xs font-semibold mb-1">{piston.label}</Label>
      <div className="relative flex items-center justify-center p-10">
        {/* Front Top input */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-8px' }}>
          {renderInput(piston.fields.frontTop)}
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground"
          style={{ top: '26px' }}
        >
          {t('front')}
        </div>

        {/* Left input */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: '-52px' }}>
          {renderInput(piston.fields.left)}
        </div>

        {/* Center piston circle */}
        <div className="w-10 h-10 rounded-full border-2 border-foreground/30 bg-background flex items-center justify-center">
          <span className="text-[9px] font-medium text-muted-foreground">{t('piston')}</span>
        </div>

        {/* Right input */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ right: '-52px' }}>
          {renderInput(piston.fields.right)}
        </div>

        {/* Front Bottom input */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground"
          style={{ bottom: '26px' }}
        >
          {t('front')}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-8px' }}>
          {renderInput(piston.fields.frontBottom)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
        {/* Grid layout: 1 piston per row on mobile, 2 side by side on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
          {pistonPoints.map((piston) => renderPiston(piston))}
        </div>
      </div>
    </div>
  );
}
