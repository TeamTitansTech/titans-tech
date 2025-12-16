'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { MeasurementInput } from '../shared/MeasurementInput';

// Database format for shim thickness data (matches Prisma ShimThicknessData model)
export interface ShimThicknessDbData {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface ShimThicknessFormProps {
  lhData: ShimThicknessDbData;
  rhData: ShimThicknessDbData;
  lhErrors: Record<string, string>;
  rhErrors: Record<string, string>;
  updateLhField: (field: keyof ShimThicknessDbData, value: number | undefined) => void;
  updateRhField: (field: keyof ShimThicknessDbData, value: number | undefined) => void;
  handleLhBlur: (field: keyof ShimThicknessDbData) => void;
  handleRhBlur: (field: keyof ShimThicknessDbData) => void;
  readOnly?: boolean;
}

interface ShimPoint {
  label: string;
  data: ShimThicknessDbData;
  errors: Record<string, string>;
  updateField: (field: keyof ShimThicknessDbData, value: number | undefined) => void;
  handleBlur: (field: keyof ShimThicknessDbData) => void;
}

export function ShimThicknessForm({
  lhData,
  rhData,
  lhErrors,
  rhErrors,
  updateLhField,
  updateRhField,
  handleLhBlur,
  handleRhBlur,
  readOnly = false,
}: ShimThicknessFormProps) {
  const t = useTranslations('inspections.form.shimThickness');

  const shimPoints: ShimPoint[] = [
    {
      label: t('lh'),
      data: lhData,
      errors: lhErrors,
      updateField: updateLhField,
      handleBlur: handleLhBlur,
    },
    {
      label: t('rh'),
      data: rhData,
      errors: rhErrors,
      updateField: updateRhField,
      handleBlur: handleRhBlur,
    },
  ];

  const renderInput = (
    field: keyof ShimThicknessDbData,
    data: ShimThicknessDbData,
    errors: Record<string, string>,
    updateField: (field: keyof ShimThicknessDbData, value: number | undefined) => void,
    handleBlur: (field: keyof ShimThicknessDbData) => void,
  ) => (
    <MeasurementInput
      field={field}
      value={data[field]}
      onChange={updateField}
      onBlur={handleBlur}
      error={errors[field]}
      readOnly={readOnly}
    />
  );

  const renderShimPoint = (point: ShimPoint) => (
    <div className="flex flex-col items-center gap-1">
      <Label className="text-xs font-semibold mb-1 flex items-center gap-1">{point.label}</Label>
      <div className="relative flex items-center justify-center p-10">
        {/* Top input */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-8px' }}>
          {renderInput('top', point.data, point.errors, point.updateField, point.handleBlur)}
        </div>

        {/* Left input */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: '-82px' }}>
          {renderInput('left', point.data, point.errors, point.updateField, point.handleBlur)}
        </div>

        {/* Center circle */}
        <div className="w-10 h-10 rounded-full border-2 border-foreground/30 bg-background flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
        </div>

        {/* Right input */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ right: '-82px' }}>
          {renderInput('right', point.data, point.errors, point.updateField, point.handleBlur)}
        </div>

        {/* Bottom input */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-8px' }}>
          {renderInput('bottom', point.data, point.errors, point.updateField, point.handleBlur)}
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
    <div className="space-y-4">
      <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
        {/* Grid layout: 1 point per row on mobile, 2 side by side on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
          {shimPoints.map((point) => (
            <div key={point.label}>{renderShimPoint(point)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
