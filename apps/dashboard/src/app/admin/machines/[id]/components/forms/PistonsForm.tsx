'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { MeasurementInput } from '../shared/MeasurementInput';

// Database format for pistons data (matches Prisma PistonsData model)
export interface PistonsDbData {
  lhTop?: number;
  lhBottom?: number;
  lhLeft?: number;
  lhRight?: number;
  rhTop?: number;
  rhBottom?: number;
  rhLeft?: number;
  rhRight?: number;
}

interface PistonsFormProps {
  data: PistonsDbData;
  errors: Record<string, string>;
  updateField: (field: keyof PistonsDbData, value: number | undefined) => void;
  handleBlur: (field: keyof PistonsDbData) => void;
  readOnly?: boolean;
}

interface PistonPoint {
  label: string;
  fields: {
    top: keyof PistonsDbData;
    bottom: keyof PistonsDbData;
    left: keyof PistonsDbData;
    right: keyof PistonsDbData;
  };
}

export function PistonsForm({
  data,
  errors,
  updateField,
  handleBlur,
  readOnly = false,
}: PistonsFormProps) {
  const t = useTranslations('inspections.form.pistons');

  // Same field names for both outer and inner - the title prop indicates context
  const pistonPoints: PistonPoint[] = [
    {
      label: 'LH',
      fields: {
        top: 'lhTop',
        bottom: 'lhBottom',
        left: 'lhLeft',
        right: 'lhRight',
      },
    },
    {
      label: 'RH',
      fields: {
        top: 'rhTop',
        bottom: 'rhBottom',
        left: 'rhLeft',
        right: 'rhRight',
      },
    },
  ];

  const renderInput = (field: keyof PistonsDbData) => (
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
        {/* Top input */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-8px' }}>
          {renderInput(piston.fields.top)}
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground"
          style={{ top: '26px' }}
        >
          {t('top')}
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

        {/* Bottom input */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground"
          style={{ bottom: '26px' }}
        >
          {t('bottom')}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-8px' }}>
          {renderInput(piston.fields.bottom)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
        {/* Grid layout: 1 piston per row on mobile, 2 side by side on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
          {pistonPoints.map((piston) => (
            <div key={piston.label}>{renderPiston(piston)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
